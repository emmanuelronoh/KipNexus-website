// eslint-disable-next-line no-unused-vars
import * as React from 'react';
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
import { useNavigate, Link } from 'react-router-dom';
import { AuthDispatchContext } from '../contexts/authContext';
// import axios from 'axios';

function Copyright(props) {
  return (
    <Typography
      variant='body2'
      color='text.secondary'
      align='center'
      {...props}
    >
      {'Copyright © '}
      <Link color='inherit' to={'/'}>
        Aeshteitos
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export default function SignUp() {
  const navigate = useNavigate();
  const [isInvalid, setIsInvalid] = React.useState(false);
  const [status, setStatus] = React.useState('typing');
  const dispatch = React.useContext(AuthDispatchContext);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('submitting');

    // Get form elements
    const form = event.currentTarget;
    const inputs = form.elements;

    // Check if all required fields are filled
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].required && !inputs[i].value) {
        alert('Please fill all required fields');
        setStatus('typing');
        return;
      }
    }
    try {
      const data = new FormData(event.currentTarget);

      const response = await signUp(data);
      if (response['invalid']) {
        setIsInvalid(true);
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
          Sign up
        </Typography>
        <Box component='form' noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete='given-name'
                name='firstName'
                required
                fullWidth
                id='firstName'
                label='First Name'
                autoFocus
                onChange={() => setIsInvalid(false)}
                error={isInvalid}
                disabled={status === 'submitting'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id='lastName'
                label='Last Name'
                name='lastName'
                autoComplete='family-name'
                onChange={() => setIsInvalid(false)}
                error={isInvalid}
                disabled={status === 'submitting'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id='username'
                label='Username'
                name='username'
                autoComplete='username'
                onChange={() => setIsInvalid(false)}
                error={isInvalid}
                disabled={status === 'submitting'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id='email'
                label='Email Address'
                name='email'
                autoComplete='email'
                onChange={() => setIsInvalid(false)}
                error={isInvalid}
                disabled={status === 'submitting'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name='password'
                label='Password'
                type='password'
                id='password'
                autoComplete='new-password'
                onChange={() => setIsInvalid(false)}
                error={isInvalid}
                disabled={status === 'submitting'}
              />
            </Grid>
            {/* <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox value="allowExtraEmails" color="primary" />}
                  label="I want to receive inspiration, marketing promotions and updates via email."
                />
              </Grid> */}
          </Grid>
          <Grid>
            <Grid item>
              {isInvalid ? (
                <Typography
                  sx={{
                    mt: 3,
                    color: 'red',
                    fontSize: { s: 'x-small', m: 'medium' },
                  }}
                >
                  Username Taken and Invalid Email Address
                </Typography>
              ) : null}
            </Grid>
          </Grid>
          <Button
            type='submit'
            fullWidth
            variant='contained'
            sx={{ mt: 3, mb: 2 }}
            disabled={status === 'submitting'}
          >
            Sign Up
          </Button>
          <Grid container justifyContent='flex-end'>
            <Grid item>
              <Link to={`/signin`} variant='body2'>
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Copyright sx={{ mt: 5 }} />
    </Container>
  );
}

// sends a POST request to our /signup route
async function signUp(data) {
  return fetch(`${import.meta.env.VITE_API_URL}register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      first_name: data.get('firstName'),
      last_name: data.get('lastName'),
      username: data.get('username'),
      email: data.get('email'),
      password: data.get('password'),
    }),
  })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 403 || response.status === 400) {
          return { invalid: 'username taken and invalid email' };
        }
        throw new Error(response); // may'be another different error
      }
      return response.json().then((data) => ({
        ...data,
        sessionId: data.sessionId,
        isAuthenticated: true,
      }));
    })
    .catch((error) => console.error(error));
}
