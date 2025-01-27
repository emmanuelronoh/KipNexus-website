import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Collapse,
  Container,
  Divider,
  Fab,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Popover,
  Rating,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
  responsiveFontSizes,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import DescriptionIcon from '@mui/icons-material/Description';
import YouTubeIcon from '@mui/icons-material/YouTube';
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import {
  createCourseComment,
  createCourseEnrollment,
  createCourseRating,
  createUserCourseProgress,
  deleteCourse,
  deleteCourseComment,
  deleteCourseUnenrollment,
  deleteUserCourseProgress,
  getCorrectExercises,
  getCourse,
  getCourseComments,
  getCourseContent,
  getCourseEnrollees,
  getCourseRating,
  getSectionItems,
  getSections,
  getUser,
  getUserCourseProgress,
  getUserSection,
  getWorkouts,
  getWrongExercises,
  updateCourse,
  updateCourseComment,
  updateCourseRating,
  updateSection,
  updateUserCourseProgress,
  updateUserSection,
} from '../courses';
import {
  Form,
  Link,
  redirect,
  useFetcher,
  useLoaderData,
  useNavigate,
  useRevalidator,
  useSubmit,
} from 'react-router-dom';
import DOMPurify from 'dompurify';
import { AccordionSection } from '../components/Accordion';
import getEmbedUrl from '../helper/getEmbedUrl';
import CorrectFormDialog from '../components/CorrectFormDialog';
import WrongFormDialog from '../components/WrongFormDialog';
import { Parser } from 'html-to-react';
import { useAuthToken } from '../contexts/authContext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReplyIcon from '@mui/icons-material/Reply';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons/faEllipsisV';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAtom } from 'jotai';
import { snackbarReducerAtom } from '../atoms/snackbarAtom';
import AlertDialog from '../components/AreYouSureDialog';
import image from '/images/noimg.png';
import CustomizedSnackbar from '../components/Snackbar';
import AuthenticationWall from '../components/AuthenticationWall';
import parseCourseDateTime, { parseCommentDate } from '../helper/parseDateTime';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';

let theme = createTheme();
theme = responsiveFontSizes(theme);

export async function loader({ params }) {
  // if you notice the pattern
  // everytime we do a GET request, the server respond with it's properties of our instance including it's ID
  // then we chain this to retrieve other instances too.
  // now we have a nice classic example of "callback hell" or "pyramid of doom"
  const user = await getUser();
  const course = await getCourse(params.courseId);
  let progress, userRating;
  if (!course) {
    throw new Response('', {
      status: course.status,
      statusText: course.message,
    });
  }
  const enrollees = await getCourseEnrollees(course.id);
  const courseContent = await getCourseContent(course.id);
  if (!courseContent) {
    throw new Response('', {
      status: courseContent.status,
      statusText: courseContent.message,
    });
  }

  const comments = await getCourseComments(course.id);
  try {
    [userRating, progress] = await Promise.all([
      getCourseRating(course.id).catch((error) => {
        console.error('Error getting course rating', error);
        return {};
      }),
      getUserCourseProgress(course.id).catch((error) => {
        console.error('Error getting course progress', error);
        return {};
      }),
    ]);
  } catch (error) {
    console.error("Error getting user's data", error);
  }
  try {
    const sections = await getSections(courseContent.id);
    const accordion = await Promise.all(
      sections.map(async (section) => {
        try {
          const userSection = await getUserSection(section.id);
          const sectionItems = await getSectionItems(section.id);
          const itemWorkouts = await Promise.all(
            sectionItems.map(async (item) => {
              try {
                const workouts = await getWorkouts(item.id);
                const workoutExercises = await Promise.all(
                  workouts.map(async (workout) => {
                    try {
                      const correctFormExercises = await getCorrectExercises(
                        workout.id
                      );
                      const wrongFormExercises = await getWrongExercises(
                        workout.id
                      );
                      return {
                        ...workout,
                        correctForm: correctFormExercises,
                        wrongForm: wrongFormExercises,
                      };
                    } catch (error) {
                      console.error('Error getting exercises:', error);
                      return workout;
                    }
                  })
                );
                return { ...item, workouts: workoutExercises };
              } catch (error) {
                console.error('Error getting workouts:', error);
                return item;
              }
            })
          );
          return {
            ...section,
            items: itemWorkouts,
            is_clicked: userSection?.is_clicked,
          };
        } catch (error) {
          console.error('Error getting section items:', error);
          return section;
        }
      })
    );

    return {
      user,
      course,
      courseContent,
      accordion,
      enrollees,
      comments,
      progress,
      userRating,
    };
  } catch (error) {
    console.error('Error getting sections:', error);
    return {
      user,
      course,
      courseContent,
      enrollees,
      comments,
      progress,
      userRating,
    };
  }
}

export async function action({ request, params }) {
  const formData = await request.formData();
  let enrollment, progress, unenrollment, userSection, comment, rating;

  switch (formData.get('intent')) {
    case 'enroll':
      enrollment = await createCourseEnrollment(params.courseId);
      progress = await createUserCourseProgress(params.courseId);
      break;
    case 'unenroll':
      unenrollment = await deleteCourseUnenrollment(
        formData.get('enrollmentId')
      );
      progress = await deleteUserCourseProgress(params.courseId);
      break;
    case 'createRating':
      rating = await createCourseRating(params.courseId, formData);
      break;
    case 'updateRating':
      rating = await updateCourseRating(formData.get('ratingId'), formData);
      break;
    case 'updateUserSection':
      userSection = await updateUserSection(
        formData.get('sectionId'),
        formData
      );
      break;
    case 'editing': // i.e., for the comment
      comment = await updateCourseComment(formData.get('commentId'), formData);
      break;
    case 'deleting': // i.e., for the comment
      comment = await deleteCourseComment(formData.get('commentId'));
      break;
    default:
      comment = await createCourseComment(params.courseId, formData);
  }

  return { enrollment, progress, unenrollment, userSection, comment, rating };
}

function CommentReply({ reply, level }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [status, setStatus] = React.useState('');
  const fetcher = useFetcher();
  const { token } = useAuthToken();
  const isAuthenticated = token.isAuthenticated;;
  const { user } = useLoaderData();

  const [last_created_day, last_created_hour, last_created_minute] =
    parseCommentDate(reply.comment_date); // using this to parse comment date time

  function handleClick(e) {
    setAnchorEl(e.currentTarget);
  }
  function handleClose() {
    setAnchorEl(null);
  }

  function handleClickEdit() {
    setStatus('editing');
  }
  function handleClickDelete() {
    setStatus('deleting');
    fetcher.submit(
      { intent: 'deleting', commentId: reply.id },
      { method: 'DELETE' }
    );
  }
  const open = Boolean(anchorEl);

  return (
    <Box>
      <ListItem
        secondaryAction={
          <>
            {isAuthenticated && user.user_id === reply.user_id && (
              <IconButton
                id='ellipsis'
                edge='end'
                aria-label='ellipsis'
                sx={{ p: '0.3em 0.5em' }}
                onClick={handleClick}
              >
                <FontAwesomeIcon icon={faEllipsisV} fontSize='medium' />
              </IconButton>
            )}

            <Popover
              open={open}
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              onClose={handleClose}
            >
              <Stack alignItems={'flex-start'} p={'0.4em 0.2em'}>
                <Button
                  fullWidth
                  sx={{ color: 'rgba(0, 0, 0, 0.6)', pr: 2 }}
                  onClick={handleClickEdit}
                >
                  <Box ml={-3} pl={2} pr={2}>
                    <EditIcon fontSize='smaller' />
                  </Box>
                  Edit
                </Button>
                <Divider />
                <Button
                  fullWidth
                  sx={{ color: 'rgba(0, 0, 0, 0.6)', pr: 2 }}
                  onClick={handleClickDelete}
                >
                  <Box pl={2} pr={2}>
                    <DeleteIcon fontSize='smaller' />
                  </Box>
                  Delete
                </Button>
              </Stack>
            </Popover>
          </>
        }
        alignItems='flex-start'
      >
        {status === 'editing' ? (
          <CommentTextField
            setStatus={setStatus}
            status={status}
            comment={reply}
          />
        ) : (
          <>
            <ListItemAvatar>
              <Avatar alt={reply.username} src={reply.profile_pic} />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Link
                  to={`/profile/user/${reply.user_id}`}
                  className='username-link'
                >
                  {`${reply.first_name || reply.username} ${
                    reply.last_name || ''
                  }`}
                  <Typography
                    ml={1}
                    component='span'
                    fontSize='smaller'
                    color='text.secondary'
                  >
                    {last_created_day === 0 && last_created_hour <= 1
                      ? `${last_created_minute} minutes ago`
                      : last_created_day === 0 && last_created_hour <= 24
                        ? `${last_created_hour} hours ago`
                        : `${last_created_day} days ago`}
                  </Typography>
                </Link>
              }
              secondary={reply.comment}
            />
          </>
        )}
      </ListItem>
      <ListItemText
        inset={true}
        // style={{ paddingLeft: `${(level + 1) * 20}px` }}
      >
        <IconButton
          onClick={() => setStatus('replying')}
          sx={{ borderRadius: 3, mt: -1 }}
        >
          <ReplyIcon sx={{ fontSize: 19 }} />{' '}
          <Typography variant='span' sx={{ fontSize: 14 }}>
            Reply
          </Typography>
        </IconButton>
      </ListItemText>
      {status === 'replying' && (
        <Box pl={`20px`}>
          <CommentTextField
            setStatus={setStatus}
            parentComment={reply.id}
            username={`@${reply.first_name || reply.username} ${
              reply.last_name || ''
            }`}
          />
        </Box>
      )}
      <CourseCommentReplies comment={reply} level={level + 1} />
    </Box>
  );
}

function CourseCommentReplies({ comment, level = 0 }) {
  const [open, setOpen] = React.useState(false);
  const totalReplies = comment.replies.length;
  const [parent] = useAutoAnimate();

  return (
    <Grid container>
      {totalReplies !== 0 && level === 0 && (
        <Grid item xs={12} style={{ paddingLeft: `${level * 20}px` }}>
          <Button startIcon={<ExpandMoreIcon />} onClick={() => setOpen(!open)}>
            {totalReplies} {totalReplies === 1 ? 'reply' : 'replies'}
          </Button>
        </Grid>
      )}
      <Grid item xs>
        <Collapse in={open || level !== 0} timeout='auto' unmountOnExit>
          <List ref={parent} component='div' disablePadding>
            {comment.replies.map((reply) => (
              <CommentReply key={reply.id} reply={reply} level={level} />
            ))}
          </List>
        </Collapse>
      </Grid>
    </Grid>
  );
}

function Comment({ comment }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [status, setStatus] = React.useState('');
  const fetcher = useFetcher();
  const { token } = useAuthToken();
  const isAuthenticated = token.isAuthenticated;
  const { user } = useLoaderData();
  const [last_created_day, last_created_hour, last_created_minute] =
    parseCommentDate(comment.comment_date); // using this to parse comment date time
  function handleClick(e) {
    setAnchorEl(e.currentTarget);
  }
  function handleClose() {
    setAnchorEl(null);
  }

  function handleClickEdit() {
    setStatus('editing');
  }
  function handleClickDelete() {
    setStatus('deleting');
    fetcher.submit(
      { intent: 'deleting', commentId: comment.id },
      { method: 'DELETE' }
    );
  }

  const open = Boolean(anchorEl);

  return (
    <Box>
      <ListItem
        secondaryAction={
          <>
            {isAuthenticated && user.user_id === comment.user_id && (
              <IconButton
                id='ellipsis'
                edge='end'
                aria-label='ellipsis'
                sx={{ p: '0.3em 0.5em' }}
                onClick={handleClick}
              >
                <FontAwesomeIcon icon={faEllipsisV} fontSize='medium' />
              </IconButton>
            )}

            <Popover
              open={open}
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              onClose={handleClose}
            >
              <Stack alignItems={'flex-start'} p={'0.4em 0.2em'}>
                <Button
                  fullWidth
                  sx={{ color: 'rgba(0, 0, 0, 0.6)', pr: 2 }}
                  onClick={handleClickEdit}
                >
                  <Box ml={-3} pl={2} pr={2}>
                    <EditIcon fontSize='smaller' />
                  </Box>
                  Edit
                </Button>
                <Divider />
                <Button
                  fullWidth
                  sx={{ color: 'rgba(0, 0, 0, 0.6)', pr: 2 }}
                  onClick={handleClickDelete}
                >
                  <Box pl={2} pr={2}>
                    <DeleteIcon fontSize='smaller' />
                  </Box>
                  Delete
                </Button>
              </Stack>
            </Popover>
          </>
        }
        alignItems='flex-start'
      >
        {status === 'editing' ? (
          <CommentTextField
            status={status}
            setStatus={setStatus}
            comment={comment}
          />
        ) : (
          <>
            <ListItemAvatar>
              <Link
                to={`/profile/user/${comment.user_id}`}
                style={{ textDecoration: 'none', color: 'initial' }}
              >
                <Avatar alt={comment.username} src={comment.profile_pic} />
              </Link>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Link
                  to={`/profile/user/${comment.user_id}`}
                  className='username-link'
                >
                  {`${comment.first_name || comment.username} ${
                    comment.last_name || ''
                  }`}
                  <Typography
                    ml={1}
                    component='span'
                    fontSize='smaller'
                    color='text.secondary'
                  >
                    {last_created_day === 0 && last_created_hour <= 1
                      ? `${last_created_minute} minutes ago`
                      : last_created_day === 0 && last_created_hour <= 24
                        ? `${last_created_hour} hours ago`
                        : `${last_created_day} days ago`}
                  </Typography>
                </Link>
              }
              secondary={comment.comment}
            />
          </>
        )}
      </ListItem>
      <ListItemText inset={true}>
        <IconButton
          onClick={() => setStatus('replying')}
          sx={{ borderRadius: 3, mt: -1 }}
        >
          <ReplyIcon sx={{ fontSize: 19 }} />{' '}
          <Typography variant='span' sx={{ fontSize: 14 }}>
            Reply
          </Typography>
        </IconButton>
      </ListItemText>
      {status === 'replying' && (
        <Box pl={'56px'}>
          <CommentTextField
            status={status}
            setStatus={setStatus}
            parentComment={comment.id}
          />
        </Box>
      )}
      <Box pl={'56px'}>
        <CourseCommentReplies comment={comment} />
      </Box>

      <Divider variant='inset' component='li' />
    </Box>
  );
}

function CourseComments() {
  const { comments } = useLoaderData();
  const [parent] = useAutoAnimate();
  console.log(comments);
  return (
    <List
      ref={parent}
      sx={{ width: '100%', maxWidth: 'inherit', bgcolor: 'background.paper' }}
    >
      <ListItem sx={{ pl: 0, pr: 0 }}>
        <CommentTextField />
      </ListItem>
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </List>
  );
}

function CommentTextField({
  status,
  setStatus,
  comment = '',
  parentComment,
  username,
}) {
  const [isTyping, setIsTyping] = React.useState(false);
  const [text, setText] = React.useState(username || '');
  const { user } = useLoaderData();
  const { token } = useAuthToken();
  const isAuthenticated = token.isAuthenticated;
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const revalidator = useRevalidator();

  function handleFocus() {
    if (!isAuthenticated) {
      navigate('/signin');
    } else {
      setIsTyping(true);
    }
  }

  function handleChange(e) {
    setText(e.target.value);
  }
  React.useEffect(() => {
    if (fetcher.state === 'submitting') {
      setText('');
      setIsTyping(!isTyping);
      setStatus && setStatus('');
      revalidator.revalidate(); // this will & should cause a re-render so that the comment useLoaderData in CourseComments (parent component) is updated.
    }
  }, [fetcher]);
  return (
    <>
      {fetcher.state === 'idle' ? (
        <Grid container justifyContent={'flex-start'}>
          <ListItemAvatar>
            <Avatar
              alt='myPP'
              src={`${import.meta.env.VITE_API_URL}${user?.profile_pic}`}
            />
          </ListItemAvatar>
          <Grid item xs>
            <TextField
              id='standard-multiline-static'
              multiline
              placeholder='Add a comment..'
              variant='standard'
              fullWidth
              onFocus={handleFocus}
              onChange={handleChange}
              value={text || comment.comment}
            />
          </Grid>
          {(isTyping || status === 'editing') && (
            <Grid item container justifyContent={'flex-end'}>
              <Grid item>
                <Button
                  sx={{ borderRadius: 3 }}
                  onClick={() => {
                    setIsTyping(!isTyping);
                    setStatus && setStatus('');
                  }}
                >
                  Cancel
                </Button>
              </Grid>
              <fetcher.Form method='post'>
                <Grid item>
                  <Button
                    variant='contained'
                    sx={{ borderRadius: 3 }}
                    name='comment'
                    value={text}
                    type='submit'
                    disabled={!text}
                  >
                    {status === 'replying'
                      ? 'Reply'
                      : status === 'editing'
                        ? 'Save'
                        : 'Comment'}
                  </Button>
                </Grid>
                {parentComment && (
                  <TextField
                    type='hidden'
                    name='parent_comment'
                    value={parentComment}
                  />
                )}{' '}
                {/* if user is replying to a comment render this hidden Textfield */}
                {comment.id && (
                  <>
                    {/* if user is editing his own comment render this two hidden TextFields */}
                    <TextField type='hidden' name='intent' value={status} />
                    <TextField
                      type='hidden'
                      name='commentId'
                      value={comment.id}
                    />
                  </>
                )}
              </fetcher.Form>
            </Grid>
          )}
        </Grid>
      ) : (
        <Grid container justifyContent={'center'}>
          <Grid item>
            <CircularProgress />
          </Grid>
        </Grid>
      )}
    </>
  );
}

// responsible for the 'workout' demo card
function WorkoutMediaCard({ workout, open }) {
  const [isOpenCorrect, setisOpenCorrect] = React.useState(false);
  const [isOpenWrong, setisOpenWrong] = React.useState(false);
  const myTheme = useTheme();
  const handleClickOpen = (btn) => {
    if (btn === 'correct') {
      setisOpenCorrect(true);
    } else {
      setisOpenWrong(true);
    }
  };

  return (
    open && (
      <>
        <Card
          data-cy='Workout Card'
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: { xs: '401.921875px', sm: '100%' },
            maxWidth: 400,
            maxHeight: { xs: 700, md: 725 },
            height: '100%',
            borderTop: `4px solid ${myTheme.palette.secondary.main}`,
          }}
        >
          <CardMedia
            component='img'
            sx={{ aspectRatio: 16 / 9 }}
            src={workout.demo}
            alt='workout demo'
          />
          <CardContent sx={{ padding: '10px 0 10px 10px' }}>
            <Container
              width='inherit'
              sx={{ height: { xs: 300, md: 350 }, overflow: 'auto' }}
            >
              <Box
                className='html-content'
                component='div'
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(workout.exercise),
                }}
              />
            </Container>
          </CardContent>
          <CardActions sx={{ marginTop: 'auto' }}>
            <Grid
              container
              justifyContent={'center'}
              columns={{ xs: 4, sm: 8 }}
              spacing={2}
              paddingBottom={2}
            >
              <Grid item xs={4} sm={4}>
                <Button
                  onClick={() => handleClickOpen('correct')}
                  startIcon={<CheckIcon color='success' />}
                  color='success'
                  fullWidth={true}
                  variant='outlined'
                  size='large'
                >
                  Form
                </Button>
                <CorrectFormDialog
                  correctFormExercises={workout.correctForm}
                  open={isOpenCorrect}
                  setOpen={setisOpenCorrect}
                />
              </Grid>
              <Grid item xs={4} sm={4}>
                <Button
                  onClick={() => handleClickOpen('wrong')}
                  startIcon={<ClearIcon color='error' />}
                  color='error'
                  fullWidth={true}
                  variant='outlined'
                  size='large'
                >
                  Form
                </Button>
                <WrongFormDialog
                  wrongFormExercises={workout.wrongForm}
                  open={isOpenWrong}
                  setOpen={setisOpenWrong}
                />
              </Grid>
            </Grid>
          </CardActions>
        </Card>
      </>
    )
  );
}

export function ResponsiveDialog({ accordionItem, children }) {
  const [open, setOpen] = React.useState(false);
  const [isWorkoutRoutine, setIsWorkoutRoutine] = React.useState(
    accordionItem?.workouts?.length > 0
  );
  const theme2 = useTheme();
  const fullScreen = useMediaQuery(theme2.breakpoints.down('sm'));
  const htmlToReactParser = new Parser();
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
        {/* <YouTubeIcon theme={theme2} sx={{ position: 'absolute', left: 10 }} fontSize="x-small"></YouTubeIcon> */}
        <Box display='flex' alignItems={'center'}>
          <DescriptionIcon
            sx={{ marginRight: 2 }}
            fontSize='x-small'
          ></DescriptionIcon>
          <Typography
            align='justify'
            variant='body'
            onClick={handleClickOpen}
            sx={{
              width: '100%',
              wordBreak: 'break-word',
              cursor: 'pointer',
              '&:hover': { color: 'lightgray' },
            }}
          >
            {children}
          </Typography>
        </Box>
      </ThemeProvider>

      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby='responsive-dialog-title'
        fullWidth={true}
        maxWidth={'md'}
      >
        <Grid container>
          <Grid
            item
            container
            justifyContent={'center'}
            marginLeft={{ md: 2 }}
            marginRight={{ md: 2 }}
          >
            <DialogTitle id='responsive-dialog-title'>
              <ButtonGroup disableElevation aria-label='button group'>
                <Button
                  onClick={() => setIsWorkoutRoutine(true)}
                  variant={isWorkoutRoutine ? 'contained' : 'outlined'}
                >
                  Workout Routine
                </Button>
                <Button
                  onClick={() => setIsWorkoutRoutine(false)}
                  variant={isWorkoutRoutine ? 'outlined' : 'contained'}
                >
                  Video Lecture / Readme
                </Button>
              </ButtonGroup>
            </DialogTitle>
          </Grid>
          <Grid
            item
            container
            justifyContent={'center'}
            marginLeft={{ md: 2 }}
            marginRight={{ md: 2 }}
          >
            <DialogContent>
              {isWorkoutRoutine ? (
                <Grid
                  justifyContent={{ xs: 'center', sm: 'flex-start' }}
                  item
                  container
                  rowSpacing={2}
                  columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                  columns={12}
                >
                  {accordionItem.workouts.length > 0 ? (
                    accordionItem.workouts.map((workout) => (
                      <Grid key={workout.id} item sm={6}>
                        <WorkoutMediaCard workout={workout} open={open}>
                          {' '}
                        </WorkoutMediaCard>
                      </Grid>
                    ))
                  ) : (
                    <Grid item>
                      <ThemeProvider theme={theme}>
                        <Typography variant='body1' height={350}>
                          No Workouts To Show
                        </Typography>
                      </ThemeProvider>
                    </Grid>
                  )}
                </Grid>
              ) : (
                <Grid justifyContent={'center'} item container>
                  <Grid item xs={10}>
                    <Box
                      mt={4}
                      className='course-preview-container'
                      component={'div'}
                    >
                      <Plyr
                        source={{
                          type: 'video',
                          sources: [
                            {
                              src: getEmbedUrl(accordionItem?.lecture) || '',
                              provider: 'youtube',
                            },
                          ],
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item mt={4} container xs={10}>
                    <Grid item>
                      <ThemeProvider theme={theme}>
                        <Typography variant='h4' fontWeight={'bold'}>
                          Description
                        </Typography>
                      </ThemeProvider>
                    </Grid>
                  </Grid>
                  <Grid className='html-content' item mt={4} xs={10}>
                    {htmlToReactParser.parse(accordionItem.description)}
                  </Grid>
                </Grid>
              )}
            </DialogContent>
          </Grid>
        </Grid>

        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export function ControlledAccordions() {
  const [expanded, setExpanded] = React.useState(false);
  const { accordion, progress } = useLoaderData();
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <>
      {accordion?.map((accordion) => (
        <AccordionSection
          key={accordion.id}
          handleChange={handleChange}
          expanded={expanded}
          accordion={accordion}
        />
      ))}
    </>
  );
}

export default function Course() {
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery((theme) => theme.breakpoints.up('md'));
  const { user, course, courseContent, enrollees, userRating } =
    useLoaderData();
  const htmlToReactParser = new Parser();
  const { token } = useAuthToken();
  const isAuthenticated = token.isAuthenticated;
  const navigate = useNavigate();
  const isInstructor = user.user_id === course.created_by;
  const isAdmin = user.is_superuser || user.is_staff;
  const enrollment = enrollees.find(
    (enrollee) =>
      enrollee.user === user.user_id && enrollee.course.id === course.id
  );
  const [rating, setRating] = React.useState(userRating[0]?.rating || 0);
  const fetcher = useFetcher();
  const [snackbar, dispatch] = useAtom(snackbarReducerAtom);
  const submit = useSubmit();
  const [last_updated_day, last_updated_hour] = parseCourseDateTime(
    course.course_updated
  );
  function handleClickEnroll() {
    if (!isAuthenticated) {
      navigate('/signin');
    } else {
      dispatch({
        type: 'enrolled',
        text: 'You are now enrolled!',
      });
      fetcher.submit({ intent: 'enroll' }, { method: 'post' });
    }
  }
  function handleClickUnenroll() {
    dispatch({
      type: 'unenrolled',
      text: 'You are unenrolled!',
    });
    fetcher.submit(
      { intent: 'unenroll', enrollmentId: enrollment.id },
      { method: 'delete' }
    );
  }

  function handleClickSignUp() {
    navigate('/signup');
  }

  function handleClickDelete() {
    dispatch({
      type: 'deleted',
      text: 'Course Deleted!',
    });
    submit(null, { method: 'delete', action: 'destroy' });
  }

  function handleClickApprove() {
    dispatch({
      type: 'approved',
      text: `Course #${course.id} Approved!`,
    });
    submit({ status: 'A' }, { method: 'patch', action: 'approve' });
  }

  function handleClickReject() {
    dispatch({
      type: 'rejected',
      text: `Course #${course.id} Rejected!`,
    });
    submit({ status: 'R' }, { method: 'patch', action: 'reject' });
  }
  return (
    <>
      <CustomizedSnackbar />
      <br></br>
      <Container component='main' maxWidth='lg'>
        <Box sx={{ marginLeft: '4vw', marginRight: '4vw' }}>
          {
            // if user is the admin or staff show the primary actions and secondary actions (i.e., approve or reject btns)
            isAdmin && course.status === 'P' && (
              <>
                <AlertDialog
                  intent="change course's status"
                  onClickApprove={handleClickApprove}
                  onClickReject={handleClickReject}
                />
              </>
            )
          }
          {
            // if user is the instructor show the primary actions and secondary actions (i.e., edit and delete btns)
            (isAdmin || isInstructor) && (
              <>
                <AlertDialog
                  onClickDelete={handleClickDelete}
                  intent='deleting course'
                />
                <Box position='fixed' bottom='20px' right='20px' zIndex={999}>
                  <Form action='edit'>
                    <Fab
                      color='primary'
                      size={isSmallScreen ? 'medium' : 'large'}
                      aria-label='edit'
                      type='submit'
                    >
                      <EditIcon />
                    </Fab>
                  </Form>
                </Box>
              </>
            )
          }

          <Box className='clearfix' component={'div'}>
            <Paper
              id='enroll'
              elevation={2}
              sx={{
                padding: { xs: '7%', md: '3%' },
                float: 'left',
                margin: { xs: '0 0 40px 0', md: '0 30px 20px 0' },
                maxWidth: { md: 450 },
              }}
            >
              <ThemeProvider theme={theme}>
                <Container
                  disableGutters
                  sx={{ maxWidth: { xs: 700, md: 500 } }}
                  component='div'
                >
                  <img
                    src={course.thumbnail || image}
                    alt="Course's image thumbnail"
                    className='course-thumbnail'
                    /* onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = image;
                                }} */
                  />
                </Container>

                <Typography
                  sx={{ maxWidth: { md: 250, xs: 300, sm: 400 }, mt: 2 }}
                  noWrap
                >
                  <b>Instructor:</b>{' '}
                  <Link
                    to={`/profile/user/${course.created_by}`}
                    className='courses-link'
                  >
                    {course.created_by_name}
                  </Link>
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mt: 2,
                  }}
                >
                  {course.price != 0 && <AttachMoneyIcon fontSize='large' />}
                  <Typography
                    fontWeight={800}
                    sx={{ fontSize: '2em' }}
                    className='price-tag'
                  >
                    {course.price == 0 ? 'FREE' : course.price}
                  </Typography>
                </Box>
                {(isInstructor && !enrollment) ||
                isAdmin ? null : (!isInstructor && !enrollment) || // Don't render the enroll buttonn for instructors or admins
                  !isAuthenticated ? (
                  <Box display='flex' justifyContent={'center'} mt={2}>
                    <Button
                      size='large'
                      sx={{ borderRadius: '2em', fontWeight: 800 }}
                      fullWidth={isSmallScreen ? true : false}
                      variant='contained'
                      onClick={handleClickEnroll}
                    >
                      Enroll now!
                    </Button>
                  </Box>
                ) : (
                  <Box display='flex' justifyContent={'center'} mt={2}>
                    <Button
                      size='large'
                      sx={{ borderRadius: '2em', fontWeight: 800 }}
                      fullWidth={isSmallScreen ? true : false}
                      variant='contained'
                      color='error'
                      onClick={handleClickUnenroll}
                    >
                      Unenroll
                    </Button>
                  </Box>
                )}

                <Grid container columns={{ xs: 6, sm: 6, md: 12 }} mt={2}>
                  <Grid item xs={6} sm={3} md={6}>
                    <Typography
                      fontSize='small'
                      variant='small'
                      color={'text.secondary'}
                    >
                      <b>Created:</b> {course.course_created}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} md={6}>
                    <Typography
                      fontSize='small'
                      variant='small'
                      color={'text.secondary'}
                    >
                      <b>Modified:</b>{' '}
                      {last_updated_day === 0 && last_updated_hour <= 24
                        ? `${last_updated_hour} hours ago`
                        : `${last_updated_day} days ago`}
                    </Typography>
                  </Grid>
                  {enrollment && (
                    <Grid item xs={6} sm={3} md={6}>
                      <Box display={'flex'} alignItems={'center'}>
                        <Typography
                          fontSize='small'
                          variant='small'
                          color={'text.secondary'}
                        >
                          <b>Your Rating:</b>
                        </Typography>
                        <Rating
                          value={rating}
                          onChange={(event, newRating) => {
                            setRating(newRating);
                            // if user has not yet rated this course then it's a post method else it's a patch
                            if (userRating[0]?.rating) {
                              fetcher.submit(
                                {
                                  rating: newRating,
                                  intent: 'updateRating',
                                  ratingId: userRating[0].id,
                                },
                                { method: 'patch' }
                              );
                            } else {
                              fetcher.submit(
                                { rating: newRating, intent: 'createRating' },
                                { method: 'post' }
                              );
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                  )}
                  <Grid item xs={6} sm={3} md={6}>
                    <Typography
                      fontSize='small'
                      variant='small'
                      color={'text.secondary'}
                    >
                      <b>Weeks:</b> {course.weeks}
                    </Typography>
                  </Grid>
                </Grid>
              </ThemeProvider>
            </Paper>
            <ThemeProvider theme={theme}>
              <Typography
                fontWeight='bold'
                variant='h2'
                sx={{ wordBreak: isMediumScreen ? 'break-word' : 'normal' }}
              >
                {course.title}
              </Typography>
            </ThemeProvider>

            {/* <Box className="html-content" component={'div'} dangerouslySetInnerHTML={{ __html: DOMPurify(course.description) }} /> */}
            <Box className='html-content' lineHeight={'1.4em'}>
              {htmlToReactParser.parse(course.description)}
            </Box>
          </Box>
          <br></br>
          <Divider />
          <Container className='course-container' maxWidth={'sm'}>
            <Grid
              mt={'2%'}
              container
              direction={'column'}
              alignItems={'center'}
              spacing={3}
            >
              <Grid item alignSelf={'flex-start'}>
                <ThemeProvider theme={theme}>
                  <Typography variant='h4' fontWeight={'bold'}>
                    Overview
                  </Typography>
                </ThemeProvider>
              </Grid>
              <Grid item alignSelf={'flex-start'}>
                <Box
                  lineHeight={'1.4em'}
                  className='html-content'
                  component='div'
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(courseContent.overview),
                  }}
                />
              </Grid>
              <Grid item xs width={'100%'}>
                <Typography
                  sx={{ textAlign: 'left' }}
                  variant='caption'
                  fontSize={'1em'}
                >
                  Preview this course
                </Typography>
                <br />
                {getEmbedUrl(courseContent.preview) ? (
                  <Box className='course-preview-container' component={'div'}>
                    {/* <iframe className="course-preview" src={getEmbedUrl(courseContent.preview)} title="vide-lecture here" allowFullScreen></iframe> */}
                    <Plyr
                      source={{
                        type: 'video',
                        sources: [
                          {
                            src: getEmbedUrl(courseContent.preview),
                            provider: 'youtube',
                          },
                        ],
                      }}
                    />
                  </Box>
                ) : (
                  <Box
                    mb='5%'
                    mt='5%'
                    height={200}
                    display='flex'
                    className='course-lecture-container'
                    justifyContent='center'
                    alignItems={'center'}
                    sx={{ border: '2px dotted black' }}
                  >
                    <Typography variant='body' align={'center'}>
                      No preview :/
                    </Typography>
                  </Box>
                )}
              </Grid>
              <br />
              {!isAuthenticated ? ( // if anonymous user, don't show the course's content
                <>
                  <AuthenticationWall onClickSignUp={handleClickSignUp} />
                </>
              ) : (
                <>
                  {!enrollment && !isInstructor && !isAdmin ? ( // if user is not enrolled, don't show the course's content
                    <>
                      <Grid
                        item
                        container
                        position={'relative'}
                        justifyContent={'flex-start'}
                      >
                        <Grid item mb={2}>
                          <ThemeProvider theme={theme}>
                            <Typography variant='h4' fontWeight={'bold'}>
                              Course content
                            </Typography>
                          </ThemeProvider>
                        </Grid>
                        <Grid
                          item
                          width={'100%'}
                          sx={{ pointerEvents: 'none' }}
                        >
                          <ControlledAccordions />
                        </Grid>
                        <Grid item width={'100%'}>
                          <Stack className='non-modal-dialog'>
                            <Grid
                              container
                              justifyContent={'center'}
                              spacing={3}
                              mt={'auto'}
                            >
                              <ThemeProvider theme={theme}>
                                <Typography
                                  align='center'
                                  gutterBottom
                                  variant='h5'
                                  fontWeight={'bold'}
                                >
                                  Enroll to view content
                                </Typography>
                              </ThemeProvider>
                              <Grid item xs={12}>
                                <Button
                                  variant='outlined'
                                  size='large'
                                  disableRipple
                                  sx={{
                                    borderRadius: 10,
                                    fontWeight: 'bolder',
                                  }}
                                  onClick={() =>
                                    document
                                      .getElementById('enroll')
                                      .scrollIntoView({ behavior: 'smooth' })
                                  }
                                  fullWidth
                                >
                                  Enroll now
                                </Button>
                              </Grid>
                            </Grid>
                          </Stack>
                        </Grid>
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item container alignSelf={'flex-start'}>
                        <Grid item mb={2}>
                          <ThemeProvider theme={theme}>
                            <Typography variant='h4' fontWeight={'bold'}>
                              Course content
                            </Typography>
                          </ThemeProvider>
                        </Grid>
                        <Grid item xs={12}>
                          <ControlledAccordions />
                        </Grid>
                      </Grid>
                    </>
                  )}
                </>
              )}
              <Grid
                item
                container
                alignSelf={'flex-start'}
                mt={
                  !isAuthenticated || (!enrollment && !isInstructor && !isAdmin)
                    ? '30vh'
                    : 'initial'
                }
              >
                <Grid item xs={12}>
                  <ThemeProvider theme={theme}>
                    <Typography variant='h5' fontWeight={'bold'}>
                      Comments
                    </Typography>
                  </ThemeProvider>
                </Grid>
                <Grid item xs>
                  <CourseComments />
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Container>
    </>
  );
}
