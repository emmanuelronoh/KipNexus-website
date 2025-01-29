import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useNavigate, Link } from 'react-router-dom';
import { AuthDispatchContext } from '../contexts/authContext';

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
  const [validationErrors, setValidationErrors] = React.useState({});
  const dispatch = React.useContext(AuthDispatchContext);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('submitting');
    setValidationErrors({});  // Clear previous validation errors

    // Get form elements
    const form = event.currentTarget;
    const inputs = form.elements;

    // Validation
    const errors = {};
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].required && !inputs[i].value) {
        errors[inputs[i].name] = 'This field is required';
      }
    }
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setStatus('typing');
      return;
    }

    try {
      const data = new FormData(event.currentTarget);

      const response = await signUp(data);
      if (response?.invalid) {
        setIsInvalid(true);
        throw new Error(response.invalid);  // Display specific invalid error
      }
      if (!response?.access) {
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
      console.error('An error occurred', error);
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
                error={Boolean(validationErrors.firstName)}
                helperText={validationErrors.firstName}
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
                error={Boolean(validationErrors.lastName)}
                helperText={validationErrors.lastName}
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
                error={Boolean(validationErrors.username)}
                helperText={validationErrors.username}
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
                error={Boolean(validationErrors.email)}
                helperText={validationErrors.email}
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
                error={Boolean(validationErrors.password)}
                helperText={validationErrors.password}
                disabled={status === 'submitting'}
              />
            </Grid>
          </Grid>
          {isInvalid && (
            <Typography sx={{ mt: 3, color: 'red', fontSize: 'medium' }}>
              Username Taken or Invalid Email Address
            </Typography>
          )}
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

async function signUp(data) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}register`, {
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
    });

    if (!response.ok) {
      if (response.status === 403 || response.status === 400) {
        return { invalid: 'Username taken or invalid email address' };
      }
      throw new Error('Request failed with status ' + response.status);
    }

    return await response.json().then((data) => ({
      ...data,
      sessionId: data.sessionId,
      isAuthenticated: true,
    }));
  } catch (error) {
    console.error('Error during sign-up:', error);
    throw error; // rethrow error for further handling
  }
}
