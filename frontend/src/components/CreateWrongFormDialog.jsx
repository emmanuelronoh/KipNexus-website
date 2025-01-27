import { useTheme } from '@emotion/react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  TextField,
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
import AddIcon from '@mui/icons-material/Add';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import DeleteIcon from '@mui/icons-material/Delete';
import InputFileUpload from './InputFileUpload';
import ReactQuill from 'react-quill';
import { modulesCard } from '../helper/quillModule';

let theme = createTheme();
theme = responsiveFontSizes(theme);

function WorkoutMediaWrongFormCard({
  errorState,
  onChangeImage,
  onClick,
  onChange,
  wrongForm,
  workoutId,
  open,
}) {
  const { isError, setIsError } = errorState;

  const [description, setDescription] = React.useState(
    wrongForm.description || ''
  );
  React.useEffect(() => {
    const handler = setTimeout(() => {
      onChange(description, 'wrongForm', workoutId, wrongForm.id);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [description]);

  return (
    open && (
      <Card
        data-cy='Wrong Form Workout Card'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: { xs: 350, sm: 400 },
          maxHeight: 645,
          height: '100%',
          borderTop: '4px solid red',
        }}
      >
        <CardMedia
          component='img'
          sx={{ aspectRatio: 16 / 9, width: { xs: 350, sm: 'auto' } }}
          src={wrongForm.demo}
          alt='workout demo'
        />
        <InputFileUpload
          wrongFormId={wrongForm.id}
          workoutId={workoutId}
          onChange={onChangeImage}
          name='demo'
          text='GIF File'
        />
        {isError && (
          <Typography
            variant='small'
            sx={{ color: 'red', textAlign: 'center', mb: 1, mt: 1 }}
          >
            Something Happend.Please try again
          </Typography>
        )}

        <CardContent>
          <Box width={{ xs: 'inherit', sm: 'inherit' }} component={'div'}>
            {/* workout description textarea input */}
            <ReactQuill
              modules={modulesCard}
              onChange={(value) => {
                setDescription(value);
                setIsError(false);
              }}
              value={description}
              className={isError ? 'ql-workout ql-error' : 'ql-workout'}
            />
          </Box>
        </CardContent>
        <CardActions sx={{ marginTop: 'auto' }}>
          <Grid container justifyContent={'center'}>
            <Grid item xs={12}>
              <Button
                fullWidth={true}
                onClick={() => onClick(workoutId, wrongForm.id, null)}
                startIcon={<DeleteIcon />}
              >
                Delete
              </Button>
            </Grid>
          </Grid>
        </CardActions>
      </Card>
    )
  );
}

export default function WrongFormDialog({
  errorState,
  eventHandlers,
  workoutId,
  wrongFormExercises,
  open,
  setOpen,
}) {
  const {
    handleImageUpload,
    handleDeleteCard,
    handleChangeDescription,
    handleAddCard: onClick,
  } = eventHandlers;

  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [parent, enableAnimations] = useAutoAnimate();

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
              ref={parent}
              justifyContent={{ xs: 'center', sm: 'flex-start' }}
              item
              container
              rowSpacing={2}
              columnSpacing={{ xs: 1, sm: 2, md: 3 }}
              columns={12}
            >
              {wrongFormExercises?.map((exercise) => (
                <Grid key={exercise.id} item sm={6}>
                  <WorkoutMediaWrongFormCard
                    errorState={errorState}
                    onChangeImage={handleImageUpload}
                    onClick={handleDeleteCard}
                    onChange={handleChangeDescription}
                    workoutId={workoutId}
                    wrongForm={exercise}
                    open={open}
                  >
                    {' '}
                  </WorkoutMediaWrongFormCard>
                </Grid>
              ))}

              <Grid item sm={6}>
                {/* add WorkoutMediaCard / Workout button */}
                <Button
                  data-cy='Add Icon Wrong-Dialog'
                  disabled={workoutId === 3}
                  onClick={() => {
                    onClick('wrongForm', workoutId);
                  }}
                  sx={{
                    height: { xs: 250, sm: 622, md: 622 },
                    width: { xs: 340, sm: '100%', md: 391 },
                  }}
                >
                  <AddIcon fontSize='large' sx={{ height: 300, width: 300 }} />
                </Button>
              </Grid>
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

// use it for the rendering of synced data later not create ui
