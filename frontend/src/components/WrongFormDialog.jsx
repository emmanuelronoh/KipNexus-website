import { useTheme } from '@emotion/react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  Grid,
  ThemeProvider,
  Typography,
  createTheme,
  responsiveFontSizes,
  useMediaQuery,
} from '@mui/material';
import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import DOMPurify from 'dompurify';

let theme = createTheme();
theme = responsiveFontSizes(theme);

function WorkoutMediaWrongFormCard({ wrongForm, open }) {
  return (
    open && (
      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 400,
          width: { xs: '401.921875px', sm: '100%' },
          maxHeight: 645,
          height: '100%',
          borderTop: '4px solid red',
        }}
      >
        <Box position='relative'>
          <CardMedia
            component='img'
            sx={{ aspectRatio: 16 / 9 }}
            src={wrongForm.demo}
            alt='workout demo'
          />
          <ClearIcon fontSize='large' className='wrong-icon' />
        </Box>

        <CardContent sx={{ padding: '1em' }}>
          <Container sx={{ height: { xs: 300, md: 350 }, overflow: 'auto' }}>
            <Box
              width='100%'
              className='html-content'
              component='div'
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(wrongForm.description),
              }}
            />
          </Container>
        </CardContent>
      </Card>
    )
  );
}

export default function WrongFormDialog({ wrongFormExercises, open, setOpen }) {
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
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
            justifyContent={'flex-start'}
            marginLeft={{ md: 2 }}
            marginRight={{ md: 2 }}
          >
            <DialogTitle id='responsive-dialog-title' sx={{ color: 'red' }}>
              {'Wrong Exercise Form'}
            </DialogTitle>
          </Grid>
          <DialogContent>
            <Grid
              justifyContent={{ xs: 'center', sm: 'flex-start' }}
              item
              container
              spacing={3}
              columns={12}
            >
              {wrongFormExercises.length ? (
                wrongFormExercises?.map((exercise) => (
                  <Grid key={exercise.id} item sm={6}>
                    <WorkoutMediaWrongFormCard
                      wrongForm={exercise}
                      open={open}
                    />
                  </Grid>
                ))
              ) : (
                <Grid item sm={12}>
                  <ThemeProvider theme={theme}>
                    <Typography variant='body1' align={'center'} height={350}>
                      No Workouts To Show
                    </Typography>
                  </ThemeProvider>
                </Grid>
              )}
            </Grid>
          </DialogContent>
        </Grid>

        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Close
          </Button>
          {/* <Button onClick={handleClose} autoFocus>
                        Agree
                    </Button> */}
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
