import { Link, useLoaderData } from 'react-router-dom';
import {
  getCourses,
  getUser,
  getUserCoursesProgress,
  getUserEnrolledCourses,
} from '../courses';
import { Parser } from 'html-to-react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Rating,
  ThemeProvider,
  Typography,
  Zoom,
  responsiveFontSizes,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import parseCourseDateTime from '../helper/parseDateTime';
import truncateText from '../helper/truncateText';
import { BorderLinearProgress } from '../components/CustomLinearProgress';

export async function loader({ request }) {
  const courses = await getUserEnrolledCourses();
  const userCoursesProgress = await getUserCoursesProgress();
  const url = new URL(request.url);
  const page = url.searchParams.get('page');
  return { courses, userCoursesProgress };
}

export default function Enrolled() {
  const { courses, userCoursesProgress } = useLoaderData();
  let theme = useTheme();
  theme = responsiveFontSizes(theme);
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const isXsmallScreen = useMediaQuery((theme) => theme.breakpoints.only('xs'));
  const htmlToReactParser = new Parser();
  const enrollCourses = courses.results.map((obj) => {
    const userProgress = userCoursesProgress.find(
      (p) => p.course === obj.course.id
    );
    obj.course.sections_completed = userProgress?.sections_completed;
    obj.course.date_enrolled = obj.date_enrolled;
    obj.course.total_sections = obj.total_sections;
    return { ...obj };
  });
  console.log(isXsmallScreen);
  return (
    <Container maxWidth='xl' component={'main'} sx={{ p: '2em' }}>
      <Box mt={5} pl={4}>
        <ThemeProvider theme={theme}>
          <Typography variant='h2' fontFamily={'Play'} fontWeight={'bolder'}>
            Enrolled Courses
          </Typography>
        </ThemeProvider>
      </Box>
      <Grid id='profile' container spacing={3} p={4}>
        {enrollCourses.map(({ course }) => {
          const [last_updated_day_course, last_updated_hour_course] =
            parseCourseDateTime(course.course_updated);
          const [last_updated_day_enrolled, last_updated_hour_enrolled] =
            parseCourseDateTime(course.date_enrolled);

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
                    sx={{ padding: 5, cursor: 'pointer', position: 'relative' }}
                    className='enrolled-course-focusHighlight'
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
                        <Box mt={2}>
                          <Typography
                            height={'auto'}
                            gutterBottom
                            fontFamily={'Play'}
                            fontSize={'1.5em'}
                            fontWeight={'bolder'}
                            sx={{ wordBreak: 'break-word' }}
                          >
                            {truncateText(course.title, 50)}
                          </Typography>
                          <Box
                            maxHeight={'2em'}
                            height={'100%'}
                            maxWidth={250}
                            sx={{ wordBreak: 'break-word' }}
                          >
                            {htmlToReactParser.parse(
                              truncateText(course.description, 69)
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
                      <b>Enrolled:</b>{' '}
                      {last_updated_day_enrolled === 0 &&
                      last_updated_hour_enrolled <= 24
                        ? `${last_updated_hour_enrolled} hours ago`
                        : `${last_updated_day_course} days ago`}
                    </Typography>
                    <Typography fontSize={'small'}>
                      <b>Enrollees:</b> {course.enrollee_count}
                    </Typography>
                    <Typography fontSize={'small'}>
                      <b>Created:</b> {course.course_created}
                    </Typography>
                    <Typography fontSize={'small'}>
                      <b>Last Modified: </b>
                      {last_updated_day_course === 0 &&
                      last_updated_hour_course <= 24
                        ? `${last_updated_hour_course} hours ago`
                        : `${last_updated_day_course} days ago`}
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
                    )}
                    <BorderLinearProgress
                      variant='determinate'
                      value={
                        (course.sections_completed * 100) /
                        course.total_sections
                      }
                      className='user-course-progress-bar'
                    />
                  </Paper>
                </Zoom>
              </Link>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}
