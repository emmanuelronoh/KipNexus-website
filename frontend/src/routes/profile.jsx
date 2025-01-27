import {
  Avatar,
  Badge,
  Box,
  Container,
  Divider,
  Grid,
  IconButton,
  Pagination,
  Paper,
  Rating,
  ThemeProvider,
  Typography,
  Zoom,
  responsiveFontSizes,
  styled,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { getCourses, getUser, getUserByItsId, updateUser } from '../courses';
import { Form, Link, useLoaderData, useSubmit } from 'react-router-dom';
import parseCourseDateTime, {
  parseUserDateTime,
} from '../helper/parseDateTime';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { VisuallyHiddenInput } from '../components/InputFileUpload';
import { useEffect, useState } from 'react';
import truncateText from '../helper/truncateText';
import { Parser } from 'html-to-react';
import { useAtom } from 'jotai';
import { profilePictureAtom } from '../atoms/profilePictureAtom';
import { useDecodedAccessToken } from '../contexts/authContext';

export async function loader({ request, params }) {
  const user = await getUserByItsId(params.userId);
  const url = new URL(request.url);
  const page = url.searchParams.get('page');
  const courses = await getCourses(true, page || 1, 'A', user.user_id);
  return { user, courses };
}

export default function Profile() {
  const { user, courses } = useLoaderData();
  const [profilePic, setProfilePic] = useAtom(profilePictureAtom);
  useEffect(() => {
    setProfilePic(user.profile_pic); // initializing our profile picture if ever there's one
  }, []); // this effect runs once on mount
  let theme = useTheme();
  theme = responsiveFontSizes(theme);
  const [date_joined_day, date_joined_month, date_joined_year] =
    parseUserDateTime(user.date_joined);
  const htmlToReactParser = new Parser();
  const { accessTokenDecoded } = useDecodedAccessToken();
  const submit = useSubmit();
  let counter = 0;
  let count = courses.count;
  const isLargeScreen = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const isXsmallScreen = useMediaQuery((theme) => theme.breakpoints.only('xs'));

  while (count > 15) {
    counter++;
    count -= 15;
  }

  function handleChangeProfile(e) {
    const file = e.target.files[0]; // file object
    const formData = new FormData();

    // read file for preview
    const reader = new FileReader();
    reader.onloadend = async () => {
      setProfilePic(reader.result);
      // then imperatively send the request without action route (note: fetcher.submit() can't handle images even with multipart/formData as ecntype)

      // Append the file to the form data
      formData.append('profile_pic', file);
      try {
        const response = await updateUser(formData);
        if (response.statusCode >= 400) {
          throw new Error(response);
        }
      } catch (error) {
        console.error('An error occured updating profile picture: ', error);
      }
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  }

  return (
    <Container
      maxWidth='xl'
      component={'main'}
      sx={{ p: '2em', display: !isLargeScreen ? 'block' : 'inline-flex' }}
    >
      <Paper
        square={false}
        sx={{
          width: { xs: 'auto', sm: 400, md: 250 },
          height: 'min-content',
          p: '1.5em 3em',
          m: isLargeScreen ? '5em auto 0 auto' : '0 auto 0 auto',
          borderRadius: 10,
        }}
        position='relative'
      >
        <Box className='profile-bg'></Box>
        <Box
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
          flexDirection={'column'}
          gap={2}
        >
          <IconButton
            disabled={accessTokenDecoded?.user_id !== user.user_id}
            component='label'
            role={undefined}
          >
            <VisuallyHiddenInput
              type='file'
              accept='image/*'
              onChange={(e) => {
                handleChangeProfile(e);
              }}
            />
            <Badge
              overlap='circular'
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <PhotoCameraIcon
                  sx={{
                    zIndex: 1,
                    background: 'white',
                    borderRadius: '5em',
                    padding: '0.1em',
                    display:
                      accessTokenDecoded?.user_id !== user.user_id
                        ? 'none'
                        : 'inline-block',
                  }}
                  fontSize='large'
                  color='primary'
                />
              }
            >
              <Avatar src={profilePic} sx={{ width: 150, height: 150 }} />
            </Badge>
          </IconButton>
        </Box>
        <Box
          display={'flex'}
          alignItems={'flex-start'}
          flexDirection={'column'}
          mt={2}
        >
          <Typography
            fontWeight='bolder'
            fontSize={isLargeScreen ? '1em' : '2em'}
            variant={isLargeScreen ? 'h4' : 'h2'}
            gutterBottom
          >
            {user.first_name || ''} {user.last_name || ''}
          </Typography>
          <Typography color='grey'>Username: {user.username}</Typography>
          <Typography color='grey'>
            Date joined: {date_joined_day}/{date_joined_month}/
            {date_joined_year}
          </Typography>
        </Box>
      </Paper>
      <Box mt={isLargeScreen ? 0 : 2} ml={2}>
        <ThemeProvider theme={theme}>
          <Typography
            variant='h2'
            fontFamily={'Play'}
            fontWeight={'bolder'}
            mb={2}
            gutterBottom
          >
            {`${user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}'s Courses`}
          </Typography>
        </ThemeProvider>
        <Grid id='profile' container spacing={3}>
          {courses.results.map((course) => {
            const [last_updated_day, last_updated_hour] = parseCourseDateTime(
              course.course_updated
            );
            return (
              <Grid key={course.id} item xs={12} md={6}>
                <Link
                  to={`/course/${course.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Zoom in={true}>
                    <Paper
                      square={false}
                      elevation={2}
                      sx={{
                        padding: 5,
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                      className='profile-course-focusHighlight'
                    >
                      <Box
                        display={'flex'}
                        gap={2}
                        position={'relative'}
                        mb={2}
                        height={170}
                      >
                        <Box
                          width={200}
                          height={150}
                          p={2}
                          border='1px dashed black'
                          sx={{
                            backgroundImage: `url(${course.thumbnail})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            boxSizing: 'border-box',
                          }}
                        >
                          {/* <img src={course.thumbnail} alt="course-thumbnail" style={{maxWidth: '100%', maxHeight: '100%' }} /> */}
                        </Box>
                        {!isXsmallScreen && (
                          <Box mt={2} width={'100%'}>
                            <Typography
                              height={'auto'}
                              gutterBottom
                              fontFamily={'Play'}
                              fontSize={'1.4em'}
                              fontWeight={'bolder'}
                              sx={{ wordBreak: 'break-word' }}
                            >
                              {truncateText(course.title, 40)}
                            </Typography>
                            <Box
                              maxHeight={'2em'}
                              maxWidth={250}
                              sx={{ wordBreak: 'break-word' }}
                            >
                              {htmlToReactParser.parse(
                                truncateText(course.description, 60)
                              )}
                            </Box>
                          </Box>
                        )}

                        <Typography
                          variant='small'
                          color='text.secondary'
                          position={'absolute'}
                          right={0}
                        >
                          {course.difficulty_display}
                        </Typography>
                      </Box>
                      <Typography fontSize={'small'}>
                        <b>Enrollees:</b> {course.enrollee_count}
                      </Typography>
                      <Typography fontSize={'small'}>
                        <b>Created:</b> {course.course_created}
                      </Typography>
                      <Typography fontSize={'small'}>
                        <b>Last Modified: </b>
                        {last_updated_day === 0 && last_updated_hour <= 24
                          ? `${last_updated_hour} hours ago`
                          : `${last_updated_day} days ago`}
                      </Typography>
                      {!isSmallScreen && (
                        <Rating
                          name='half-rating-read'
                          size='medium'
                          defaultValue={course.average_rating}
                          precision={0.5}
                          readOnly
                          sx={{
                            position: 'absolute',
                            bottom: '1.8em',
                            right: '1.5em',
                          }}
                        />
                      )}{' '}
                    </Paper>
                  </Zoom>
                </Link>
              </Grid>
            );
          })}
        </Grid>
        <Form>
          <Box display={'flex'} justifyContent={'center'} mt={4}>
            <Pagination
              size='large'
              count={counter}
              onChange={(event, page) => {
                submit(`page=${page}`);
                const element = document.getElementById('profile');
                window.scrollTo({
                  top: element.offsetTop,
                  behavior: 'smooth',
                });
              }}
            />
          </Box>
        </Form>
      </Box>
    </Container>
  );
}
