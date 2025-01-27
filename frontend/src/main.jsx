import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './contexts/authContext';
import { ThemeProvider, createTheme } from '@mui/material';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import './divider.css';
import Root, {
  action as rootAction,
  loader as rootLoader,
} from './routes/root';
import ErrorPage from './error-page';
import SignIn from './routes/SignIn';
import SignUp from './routes/SignUp';
import { Index, loader as indexLoader } from './routes/index';
import Course, { loader as courseLoader } from './routes/course';
import CreateCourse from './routes/create-course';
import { action as createCourseAction } from './routes/create-course';
import { action as courseAction } from './routes/course';
import ProectedRoute from './components/protectedRoute';
import { IsLoadingProvider } from './contexts/IsLoadingContext';
import EditCourse from './routes/edit-course';
import {
  loader as editCourseLoader,
  action as editCourseAction,
} from './routes/edit-course';
import { action as deleteCourseAction } from './routes/destroy-course';
import { Pending } from './routes/pending';
import { loader as pendingLoader } from './routes/pending';
import Profile from './routes/profile';
import { loader as profileLoader } from './routes/profile';
import Enrolled, { loader as enrolledLoader } from './routes/enrolled';
import CreateBlog, { action as createBlogAction } from './routes/create-blog';
import Blogs, { loader as blogsLoader } from './routes/blogs';
import Blog, {
  loader as blogLoader,
  action as blogAction,
} from './routes/blog';
import { action as approveCourseAction } from './routes/approve-course';
import { action as rejectCourseAction } from './routes/reject-course';
import EditBlog, {
  action as editBlogAction,
  loader as editBlogLoader,
} from './routes/edit-blog';
import { action as deleteBlogAction } from './routes/destroy-blog';
import Privacy from './routes/privacy';
import Terms from './routes/terms';
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976D2',
    },
    secondary: {
      main: '#FFC55C',
    },
    background: {
      default: '#f9f7f7',
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    loader: rootLoader,
    action: rootAction,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          {
            index: true,
            element: <Index />,
            loader: indexLoader,
          },
          {
            path: 'course/:courseId',
            element: <Course />,
            loader: courseLoader,
            action: courseAction,
          },
          {
            path: 'profile/user/:userId',
            element: <Profile />,
            loader: profileLoader,
          },
          {
            path: 'blogs',
            element: <Blogs />,
            loader: blogsLoader,
          },
          {
            path: 'blog/:blogId',
            element: <Blog />,
            loader: blogLoader,
            action: blogAction,
          },
          {
            path: 'privacy',
            element: <Privacy />,
          },
          {
            path: 'terms',
            element: <Terms />,
          },
        ],
      },
      {
        element: <ProectedRoute />,
        errorElement: <ErrorPage />,
        children: [
          {
            path: 'course/create',
            element: <CreateCourse />,
            action: createCourseAction,
          },
          {
            path: 'course/:courseId/edit',
            element: <EditCourse />,
            loader: editCourseLoader,
            action: editCourseAction,
          },
          {
            path: 'course/:courseId/destroy',
            action: deleteCourseAction,
          },
          {
            path: 'course/:courseId/approve',
            action: approveCourseAction,
          },
          {
            path: 'course/:courseId/reject',
            action: rejectCourseAction,
          },
          {
            path: 'pending',
            element: <Pending />,
            loader: pendingLoader,
          },
          {
            path: 'enrolled/user/:userId',
            element: <Enrolled />,
            loader: enrolledLoader,
          },
          {
            path: 'blog/create',
            element: <CreateBlog />,
            action: createBlogAction,
          },
          {
            path: 'blog/:blogId/edit',
            element: <EditBlog />,
            loader: editBlogLoader,
            action: editBlogAction,
          },
          {
            path: 'blog/:blogId/destroy',
            action: deleteBlogAction,
          },
        ],
      },
    ],
  },
  // if you're wondering why I didn't use react-router's action route.
  // yes, i was dumb, i overlooked it and i think i was still studying react-router when implementing the signUp and signIn routes
  // so forgive my ignorance
  {
    path: '/signup',
    element: <SignUp />,
  },
  {
    path: '/signin',
    element: <SignIn />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <IsLoadingProvider>
          <RouterProvider router={router} />
        </IsLoadingProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
