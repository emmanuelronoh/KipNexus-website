import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import Checkbox from '@mui/material/Checkbox';
// import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useContext, useState } from 'react';
import { AuthDispatchContext } from '../contexts/authContext';
import { useNavigate, Link } from 'react-router-dom';

function Copyright(props) {
  return (
    <Typography
      variant='body2'
      color='text.secondary'
      align='center'
      {...props}
    >
      {'Copyright © '}
      <Link color='inherit' to={`/`}>
      KipNexus
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export default function SignIn() {
  const [isInvalidCredentials, setIsInvalidCredentials] = useState(false);
  const [status, setStatus] = useState('typing');
  const dispatch = useContext(AuthDispatchContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    // when sign in button is click. handles authentication, if valid redirect and set cookie
    event.preventDefault();
    try {
      setStatus('submitting');
      const data = new FormData(event.currentTarget);
      const response = await signIn(data);
      if (response['invalid']) {
        setIsInvalidCredentials(true);
        throw new Error(response);
      }
      if (!response.access) {
        // Handle session auth (Chrome/Safari)
        const sessionId = response.sessionId;

        dispatch({
          type: 'setSession',
          sessionId: sessionId,
          isAuthenticated: true,
        });
      } else {
        // handle JWT for Firefox
        dispatch({
          type: 'setToken',
          access: response['access'],
          refresh: response['refresh'],
        });
      }
      navigate('/');
    } catch (error) {
      console.error('An error occured', error);
      setStatus('typing');
    }
  };

  return (
    <Container component='main' maxWidth='xs'>
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component='h1' variant='h5'>
          Sign in
        </Typography>
        <Box component='form' onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            onChange={() => setIsInvalidCredentials(false)}
            margin='normal'
            required
            fullWidth
            id='username'
            label='username'
            name='username'
            autoComplete='username'
            autoFocus
            error={isInvalidCredentials}
            disabled={status === 'submitting'}
          />
          <TextField
            onChange={() => setIsInvalidCredentials(false)}
            margin='normal'
            required
            fullWidth
            name='password'
            label='Password'
            type='password'
            id='password'
            autoComplete='current-password'
            error={isInvalidCredentials}
            disabled={status === 'submitting'}
          />
          {/* <FormControlLabel
                        control={<Checkbox value="remember" color="primary" />}
                        label="Remember me"
                    /> */}
          {isInvalidCredentials ? (
            <Typography
              sx={{
                color: 'red',
                fontSize: 'medium',
              }}
            >
              Invalid Username and Password!
            </Typography>
          ) : null}
          <Button
            type='submit'
            fullWidth
            variant='contained'
            sx={{ mt: 3, mb: 2 }}
            disabled={status === 'submitting'}
          >
            Sign In
          </Button>
          <Grid container>
            {/* <Grid item xs>
                            <Link href="#" variant="body2">
                                Forgot password?
                            </Link>
                        </Grid> */}
            <Grid item>
              <Link to={'/signup'} variant='body2'>
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
  );
}

// sends a POST request to /signin route
function signIn(data) {
  // User login API authentication

  // route "/login"
  return fetch(`${import.meta.env.VITE_API_URL}login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      username: data.get('username'),
      password: data.get('password'),
    }),
  }).then((response) => {
    if (!response.ok) {
      return { invalid: true };
    }
    return response.json().then((data) => ({
      ...data,
      sessionId: data.sessionId,
      isAuthenticated: true,
    }));
  });
}
