import { useEffect } from 'react';
import { Outlet, useNavigate, useNavigation } from 'react-router-dom';
import { useAuthToken } from '../contexts/authContext';
import validateAuthStatus from '../helper/verifyAuth';

export default function ProectedRoute() {
  const { token } = useAuthToken();
  const isAuthenticated = token.isAuthenticated;
  const navigate = useNavigate();

  // // here we are persisting log in state
  // useEffect(() => {
  //   const verifyRefreshToken = async () => {
  //     try {
  //       await persistToken();
  //     }
  //     catch (err) {
  //       console.error(err);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }
  //   !isAuthenticated ? verifyRefreshToken() : setIsLoading(false);

  // }, []);

  useEffect(() => {
    (async () => {
      const auth = await validateAuthStatus(); // we verify the signature of the cookie (i.e., the HTTP-only cookie in the storage) OR the session
      if (!isAuthenticated && !auth.isAuthenticated) {
        navigate('/signin');
      }
    })();
  }, [isAuthenticated]);

  return (
    <>
      <Outlet />
    </>
  );
}
