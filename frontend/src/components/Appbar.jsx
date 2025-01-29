/* eslint-disable no-unused-vars */
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
// eslint-disable-next-line no-unused-vars
import AdbIcon from '@mui/icons-material/Adb';
import { useState } from 'react';
import { Link, useFetcher, useLoaderData, useNavigate } from 'react-router-dom';
import { useAuthToken } from '../contexts/authContext';
import SearchIcon from '@mui/icons-material/Search';
import {
  Badge,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Popover,
  Slide,
  useMediaQuery,
} from '@mui/material';
import TextField from '@mui/material/TextField';
import logo from '/images/KipNexuslogo.png';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SearchBar from './SearchBar';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import parseCourseDateTime from '../helper/parseDateTime';
import { useAtom, useAtomValue } from 'jotai';
import { profilePictureAtom } from '../atoms/profilePictureAtom';
import isFirefox from '../helper/isFirefox';
const pages = ['Courses', 'Blog', 'Create'];
const settings = ['Profile', 'Enrolled', 'Logout'];


function NavLinks({ pageHandlers }) {
  return pages.map((page) => (
    <MenuItem key={page} onClick={pageHandlers[page]}>
      {page === 'Courses' ? (
        <Link to='/#courses' className='courses-link'>
          <Typography textAlign='center'>{page}</Typography>{' '}
        </Link>
      ) : (
        <Typography textAlign='center'>{page}</Typography>
      )}
    </MenuItem>
  ));
}

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [anchorElBadge, setAnchorElBadge] = React.useState(null);
  const [isOpen, setIsOpen] = React.useState(false); // search dialog
  const { token, dispatch } = useAuthToken(); // returns the token state and it's dispatch function
  const isAuthenticated = token.isAuthenticated;
  const navigate = useNavigate();
  const { user, courses } = useLoaderData(); // loader is in root.jsx
  const userCourses = Array.isArray(courses) ? courses.filter(
    (course) => course.created_by === user.user_id && course.status !== 'P'
  ) : [];

  const profilePic = useAtomValue(profilePictureAtom || '');
  const [firstClick, setFirstClick] = React.useState(true);
  const didRun = React.useRef(false);
  const fetcher = useFetcher();

  React.useEffect(() => {
    // this is would only execute once regardless of how many times this component rerenders
    if (!didRun.current && (user.is_staff || user.is_superuser)) {
      pages.push('Pending');
      didRun.current = true;
    }
  }, []);

  // attach event listener to  each setting
  const settingsHandlers = {
    Profile: () => navigate(`/profile/user/${user.user_id}`),
    // 'Account': () => { },
    Enrolled: () => navigate(`/enrolled/user/${user.user_id}`),
    Logout: () => handleLogout(dispatch),
  };

  // attach event listener to each page in navbar
  const pageHandlers = {
    // 'Courses': <Link to="/#courses" />,
    Blog: () => navigate('/blogs'),
    Create: () => navigate('/course/create'),
    Pending: () => navigate('/pending'),
  };

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleClickBadge = (event) => {
    setAnchorElBadge(event.currentTarget);
    if (firstClick) {
      setFirstClick(false);
      // if first click
      // Only run this once to update the course instance's read to true.
      userCourses.map((course) =>
        fetcher.submit({ read: true, courseId: course.id }, { method: 'PATCH' })
      );
    }
  };

  async function handleLogout(dispatch) {
    await signOut(token['refresh']);
    if (isFirefox()) {
      await dispatch({
        type: 'removeToken',
      });
    } else {
      await dispatch({
        type: 'removeSession',
      });
    }
    window.location.reload();
  }

  return (
    <>
      <AppBar position='fixed'>
        <Container maxWidth='xl'>
          <Toolbar disableGutters>
            <Avatar
              alt='logo'
              src={logo}
              sx={{
                display: { xs: 'none', md: 'flex' },
                mr: 1,
                height: 40,
                width: 40,
              }}
            />
            <Link to='/' className='courses-link'>
              <Typography
                variant='h6'
                noWrap
                sx={{
                  mr: 2,
                  display: { xs: 'none', md: 'flex' },
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '.3rem',
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                KipNexus
              </Typography>
            </Link>
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size='large'
                aria-label='account of current user'
                aria-controls='menu-appbar'
                aria-haspopup='true'
                onClick={handleOpenNavMenu}
                color='inherit'
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id='menu-appbar'
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                <NavLinks pageHandlers={pageHandlers} />
              </Menu>
            </Box>
            <Typography
              variant='h6'
              noWrap
              component='a'
              href='/'
              sx={{
                mr: 0,
                display: { sm: 'flex', md: 'none' },
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              KipNexus
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) =>
                page === 'Courses' ? (
                  <Link key={page} to='/#courses' className='courses-link'>
                    <Button sx={{ my: 2, color: 'white', display: 'block' }}>
                      {page}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    key={page}
                    onClick={pageHandlers[page]}
                    sx={{ my: 2, color: 'white', display: 'block' }}
                  >
                    {page}
                  </Button>
                )
              )}
            </Box>
            {isAuthenticated ? (
              <Box sx={{ flexGrow: 0 }}>
                <Grid
                  direction='row-reverse'
                  container
                  alignItems={'center'}
                  spacing={1}
                >
                  <Grid item xs={4} sm>
                    <Tooltip data-cy='Tool tip' title='Open settings'>
                      <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                        <Avatar
                          data-cy='Avatar'
                          alt='myPP'
                          src={
                            profilePic ||
                            `${import.meta.env.VITE_API_URL}${user.profile_pic}`
                          }
                        />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={4} sm>
                    <IconButton
                      aria-label='notification'
                      sx={{ color: 'white' }}
                      onClick={handleClickBadge}
                    >
                      <Badge
                        badgeContent={
                          userCourses.filter((course) => !course.read).length
                        }
                      >
                        <NotificationsOutlinedIcon />
                      </Badge>

                    </IconButton>
                    <Popover
                      open={Boolean(anchorElBadge)}
                      onClose={() => setAnchorElBadge(null)}
                      anchorEl={anchorElBadge}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                    >
                      <Grid container width={500} padding={'0 1em'}>
                        <Typography
                          sx={{ mt: 4, mb: 2 }}
                          variant='h5'
                          fontWeight={'bold'}
                          component='div'
                        >
                          Notifications
                        </Typography>
                        {userCourses
                          .sort(
                            (a, b) =>
                              new Date(b.course_updated) -
                              new Date(a.course_updated)
                          )
                          .map((course) => {
                            const [
                              last_updated_day,
                              last_updated_hour,
                              last_updated_minute,
                            ] = parseCourseDateTime(course.course_updated);
                            return (
                              <Grid key={course.id} item xs={10} sm={12}>
                                <List>
                                  <ListItem>
                                    <ListItemIcon>
                                      {(course.status === 'A' && (
                                        <CheckIcon color='success' />
                                      )) ||
                                        (course.status === 'R' && (
                                          <ClearIcon color='error' />
                                        ))}
                                    </ListItemIcon>
                                    <ListItemText
                                      className='text-overflow'
                                      primary={course.title}
                                      secondary={
                                        <>
                                          {`Your Course has been ${course.status === 'A' ? 'Approved' : 'Rejected'}`}
                                          <br />
                                          {last_updated_day === 0 &&
                                            last_updated_hour <= 1
                                            ? `${last_updated_minute} minutes ago`
                                            : last_updated_day === 0 &&
                                              last_updated_hour <= 24
                                              ? `${last_updated_hour} hours ago`
                                              : `${last_updated_day} days ago`}
                                        </>
                                      }
                                      sx={{ width: 350, mr: 2 }}
                                    />
                                    <Box>
                                      <img
                                        src={course.thumbnail}
                                        style={{
                                          width: '60px',
                                          height: '59px',
                                          objectFit: 'cover',
                                        }}
                                      />
                                    </Box>
                                  </ListItem>
                                </List>
                              </Grid>
                            );
                          })}
                      </Grid>
                    </Popover>
                  </Grid>
                  <SearchBar isOpen={isOpen} setIsOpen={setIsOpen} />
                </Grid>
                <Menu
                  sx={{ mt: '45px' }}
                  id='menu-appbar'
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {settings.map((setting) => (
                    <MenuItem key={setting} onClick={settingsHandlers[setting]}>
                      <Typography textAlign='center'>{setting}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            ) : (
              <Box sx={{ flexGrow: 0 }}>
                <Grid
                  container
                  spacing={{ xs: 3, sm: 1, md: 2 }}
                  alignItems={'center'}
                >
                  <SearchBar isOpen={isOpen} setIsOpen={setIsOpen} />
                  <Grid item ml={1} mr={{ xs: 0, sm: 0 }} xs>
                    <Link
                      to={`/signin`}
                      id='sign-in'
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Sign in
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Toolbar />
    </>
  );
}
export default ResponsiveAppBar;

function signOut(refreshToken) {
  // ask the backend server to delete the httpOnly jwt cookie
  const response = fetch(`${import.meta.env.VITE_API_URL}logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    credentials: 'include',
    body: JSON.stringify({
      refresh: refreshToken,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.status_code);
      }
      return response.json();
    })
    .catch((err) => console.error(err));
  sessionStorage.clear();
  return response;
}
