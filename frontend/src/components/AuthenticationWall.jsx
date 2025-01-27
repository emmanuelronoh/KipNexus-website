import {
  Button,
  Grid,
  Stack,
  ThemeProvider,
  Typography,
  createTheme,
  responsiveFontSizes,
} from '@mui/material';
import { ControlledAccordions } from '../routes/course';
import { Link } from 'react-router-dom';

export default function AuthenticationWall({ onClickSignUp }) {
  let theme = createTheme();
  theme = responsiveFontSizes(theme);

  return (
    <Grid item container position={'relative'} justifyContent={'flex-start'}>
      <Grid item mb={2}>
        <ThemeProvider theme={theme}>
          <Typography variant='h4' fontWeight={'bold'}>
            Course content
          </Typography>
        </ThemeProvider>
      </Grid>
      <Grid item xs={12} sx={{ pointerEvents: 'none' }}>
        <ControlledAccordions />
      </Grid>
      <Grid item xs={12}>
        <Stack className='non-modal-dialog'>
          <Grid
            item
            container
            justifyContent={'center'}
            spacing={3}
            mt={'auto'}
          >
            <Grid item>
              <ThemeProvider theme={theme}>
                <Typography align='center' gutterBottom variant='h5'>
                  Create an account and enroll to view content
                </Typography>
              </ThemeProvider>
            </Grid>

            <Grid item xs={7}>
              <Button
                variant='outlined'
                disableRipple
                sx={{ borderRadius: 10 }}
                fullWidth={true}
                onClick={onClickSignUp}
              >
                Sign Up
              </Button>
            </Grid>
            <Grid item xs={12}>
              {/* <Button variant="outlined" disableRipple sx={{ borderRadius: 10 }} fullWidth={true}>Sign In</Button> */}
              <ThemeProvider theme={theme}>
                <Typography align='center' gutterBottom variant='body1'>
                  Already have an account? <Link to='/signin'>Sign In</Link>
                </Typography>
              </ThemeProvider>
            </Grid>
          </Grid>
        </Stack>
      </Grid>
    </Grid>
  );
}
