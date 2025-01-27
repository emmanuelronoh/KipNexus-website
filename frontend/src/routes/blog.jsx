import {
  Avatar,
  Box,
  Button,
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
  Popover,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
  responsiveFontSizes,
} from '@mui/material';
import {
  createBlogComment,
  deleteBlogComment,
  getBlog,
  getBlogComments,
  getUser,
  updateBlogComment,
} from '../courses';
import {
  Link,
  useFetcher,
  useLoaderData,
  useNavigate,
  useRevalidator,
  useSubmit,
} from 'react-router-dom';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import parseCourseDateTime, {
  parseBlogDateTime,
  parseCommentDate,
} from '../helper/parseDateTime';
import { useTheme } from '@emotion/react';
import { Parser } from 'html-to-react';
import { useEffect, useState } from 'react';
import { useAuthToken } from '../contexts/authContext';
import ReplyIcon from '@mui/icons-material/Reply';
import EditIcon from '@mui/icons-material/Edit';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons/faEllipsisV';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export async function loader({ params }) {
  const user = await getUser();
  const blog = await getBlog(params.blogId);
  if (!blog) {
    throw new Response('', {
      status: blog.status,
      statusText: blog.message,
    });
  }

  let comments;
  try {
    comments = await getBlogComments(blog.id);
    if (comments.statusCode >= 400) {
      throw new Error(comments);
    }
  } catch (error) {
    console.error('An error occured fetching blog comments: ', error);
  }

  return { user, blog, comments };
}

export async function action({ request, params }) {
  const formData = await request.formData();
  let comment;

  switch (formData.get('intent')) {
    case 'editing':
      comment = await updateBlogComment(formData.get('commentId'), formData);
      break;
    case 'deleting':
      comment = await deleteBlogComment(formData.get('commentId'));
      break;
    default:
      comment = await createBlogComment(params.blogId, formData);
  }

  return { comment };
}

function CommentReply({ reply, level }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [status, setStatus] = useState('');
  const fetcher = useFetcher();
  const { token } = useAuthToken();
  const isAuthenticated = token.isAuthenticated;
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
      <BlogCommentReplies comment={reply} level={level + 1} />
    </Box>
  );
}

function BlogCommentReplies({ comment, level = 0 }) {
  const [open, setOpen] = useState(false);
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
  const [anchorEl, setAnchorEl] = useState(null);
  const [status, setStatus] = useState('');
  const fetcher = useFetcher();
  const { token } = useAuthToken();
  const isAuthenticated = token.isAuthenticated;;
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
        <BlogCommentReplies comment={comment} />
      </Box>

      <Divider variant='inset' component='li' />
    </Box>
  );
}

function BlogComments() {
  const { comments } = useLoaderData();
  const [parent] = useAutoAnimate();

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
  const [isTyping, setIsTyping] = useState(false);
  const [text, setText] = useState(username || '');
  const { user } = useLoaderData();
  const { token } = useAuthToken();
  const isAuthenticated = token.isAuthenticated;;
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
  useEffect(() => {
    if (fetcher.state === 'submitting') {
      setText('');
      setIsTyping(!isTyping);
      setStatus && setStatus('');
      revalidator.revalidate(); // this will & should cause a re-render so that the comment useLoaderData in BlogComments (parent component) is updated.
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

export default function Blog() {
  const { user, blog } = useLoaderData();
  let theme = useTheme();
  theme = responsiveFontSizes(theme);
  const [blog_day_name, blog_month_name, blog_day, blog_year] =
    parseBlogDateTime(blog.blog_created);
  const htmlToReactParser = new Parser();
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const submit = useSubmit();

  function handleClick(e) {
    setAnchorEl(e.currentTarget);
  }
  function handleClose() {
    setAnchorEl(null);
  }

  const open = Boolean(anchorEl);

  return (
    <Container maxWidth='md' component={'main'}>
      <Box padding={'2em'} position={'relative'}>
        <Button startIcon={<ArrowBackIosIcon />}>
          <Link to={`/blogs`} className='blogs-link'>
            Back to blog
          </Link>
        </Button>
        <Typography
          mt={1}
          fontSize={'smaller'}
          color={'text.secondary'}
          gutterBottom
        >
          {`${blog_day_name}, ${blog_month_name} ${blog_day} ${blog_year}`}
        </Typography>
        {user.user_id === blog.author.user_id && (
          <>
            <IconButton
              id='ellipsis'
              edge='end'
              aria-label='ellipsis'
              sx={{
                p: '0.3em 0.5em',
                position: 'absolute',
                right: 27,
                top: 69,
              }}
              onClick={handleClick}
            >
              <FontAwesomeIcon icon={faEllipsisV} fontSize='large' />
            </IconButton>
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
                  onClick={() => navigate('edit')}
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
                  onClick={() =>
                    submit(null, { method: 'DELETE', action: 'destroy' })
                  }
                >
                  <Box pl={2} pr={2}>
                    <DeleteIcon fontSize='smaller' />
                  </Box>
                  Delete
                </Button>
              </Stack>
            </Popover>
          </>
        )}
        <ThemeProvider theme={theme}>
          <Typography variant='h2' fontWeight={'bolder'}>
            {blog.title}
          </Typography>
          <Typography color={'text.secondary'} gutterBottom>
            {blog.summary}
          </Typography>
          <Box display={'flex'} gap={1} mb={2} mt={2}>
            <Avatar src={blog.author.profile_pic || ''} alt='Avatar' />
            <Typography mt={1} fontWeight={'bold'}>
              <Link
                to={`profile/${blog.author.user_id}`}
                className='blogs-link'
              >{`${
                blog.author.first_name && blog.author.last_name
                  ? `${blog.author.first_name} ${blog.author.last_name}`
                  : blog.author.username
              }`}</Link>
            </Typography>
          </Box>
        </ThemeProvider>
        <Divider />
        <Box
          className='html-content'
          lineHeight={'1.4em'}
          overflow={'auto'}
          mt={2}
        >
          {htmlToReactParser.parse(blog.content)}
        </Box>
        <ThemeProvider theme={theme}>
          <Typography variant='h5' fontWeight={'bold'} mt={10}>
            Leave a comment
          </Typography>
        </ThemeProvider>
        <Box>
          <BlogComments />
        </Box>
      </Box>
    </Container>
  );
}
