import { Grid, Typography, styled } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <MyThemeFooter>
      <Grid
        container
        spacing={2}
        columns={{ xs: 6, md: 4, lg: 8 }}
        alignItems={'center'}
        justifyContent={'flex-end'}
      >
        <Grid item xs={2} md={2} lg={4}>
          <Typography variant='body2' fontSize={'large'}>
            © KipNexus
          </Typography>
        </Grid>
        <Grid item xs={2} md={1} lg={2}>
          <Typography variant='body2'>
            <Link to='/privacy' className='footer-link'>
              Privacy Policy
            </Link>
          </Typography>
        </Grid>
        <Grid item xs={2} md={1} lg={2}>
          <Typography variant='body2'>
            <Link to='/terms' className='footer-link'>
              Terms of Use
            </Link>
          </Typography>
        </Grid>
        <Grid item xs={2} md={1} lg={2}>
          Contact
        </Grid>
        <Grid item xs={2} md={1} lg={2}>
          About
        </Grid>
      </Grid>
    </MyThemeFooter>
  );
}

const MyThemeFooter = styled('footer')(({ theme }) =>
  theme.unstable_sx({
    color: 'primary.contrastText',
    backgroundColor: 'primary.main',
    textAlign: 'center',
    marginTop: 'auto',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    pt: '1rem',
    pb: '1rem',
    [theme.breakpoints.down('sm')]: {
      height: 'auto',
    },
    minHeight: '2.5rem',
  })
);
