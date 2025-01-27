import { Outlet } from 'react-router-dom';
import ResponsiveAppBar from '../components/Appbar';
import { useNavigation } from 'react-router-dom';
import persistAuth from '../helper/persistAuth';
import useRefreshToken from '../helper/useRefreshToken';
import { useContext } from 'react';
import { IsLoadingContext } from '../contexts/IsLoadingContext';
import Box from '@mui/material/Box';
import { getCourses, getUser, updateCourse } from '../courses';
import Footer from '../components/Footer';

export async function loader() {
  const user = await getUser();
  let courses = await getCourses();
  return { user, courses };
}

export async function action({ request }) {
  const formData = await request.formData();
  const course = await updateCourse(formData.get('courseId'), formData);

  return { course };
}

export default function Root() {
  const navigation = useNavigation();
  const isLoading = useContext(IsLoadingContext);

  persistAuth(); // here we are persisting log in state
  useRefreshToken(); // refreshing access token when it's due if the user has a refresh token in storage.

  return (
    <>
      <ResponsiveAppBar />

      {isLoading ? (
        <Box
          sx={{
            my: '50vh',
            display: 'flex',
            gap: 3,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <progress value={null} />
          <p>Loading...</p>
        </Box>
      ) : (
        <Box
          id='detail'
          className={navigation.state === 'loading' ? 'loading' : ''}
        >
          <Outlet />
        </Box>
      )}
      <Box component={'p'} pb={20} />
      <Footer />
    </>
  );
}
