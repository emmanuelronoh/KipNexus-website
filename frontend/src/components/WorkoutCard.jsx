import { useTheme } from '@emotion/react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  useMediaQuery,
} from '@mui/material';
import * as React from 'react';
import {
  createCorrectExerciseForm,
  createWrongExerciseForm,
  deleteCorrectExerciseForm,
  deleteWrongExerciseForm,
  updateCorrectExerciseForm,
  updateWrongExerciseForm,
} from '../courses';
import ReactQuill from 'react-quill';
import { modules, modulesCard } from '../helper/quillModule';
import CorrectFormDialog from '../components/CreateCorrectFormDialog';
import WrongFormDialog from '../components/CreateWrongFormDialog';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import demoGif from '/images/chinupVecs.gif';
import InputFileUpload from './InputFileUpload';
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import demoGif2 from '/images/pushupVecs.gif';

// This workoutMediaCard is for create-course and edit-course
export default function WorkoutMediaCard({
  ids,
  immerAtom,
  onChangeImage,
  onChangeDescription,
  onClick,
  workout,
  open,
}) {
  const { accordionId, itemId } = ids;
  const [isOpenCorrect, setisOpenCorrect] = React.useState(false);
  const [isOpenWrong, setisOpenWrong] = React.useState(false);
  const theme = useTheme();

  const [isError, setIsError] = React.useState(false);
  const [, updateAccordions] = immerAtom;
  // The `workoutDescription` state variable is similar to `lecture` and `description` in ResponsiveDialog
  // it's main purpose is for debouncing
  const [workoutDescription, setWorkoutDescription] = React.useState(
    workout.exercise
  );
  const isFirstRender = React.useRef(true);
  const initialWorkoutDescription = React.useRef(workoutDescription);
  // Handles HTTP request for updating workout's description for this component
  React.useEffect(() => {
    if (
      isFirstRender.current ||
      workoutDescription === initialWorkoutDescription.current
    ) {
      isFirstRender.current = false;
      return;
    }
    // debounce event handler
    const handler = setTimeout(() => {
      onChangeDescription(workoutDescription, workout.id);
    }, 300);
    return () => {
      clearTimeout(handler);
    };
  }, [workoutDescription]);

  function handleImageUpload(event, workoutId, wrongFormId, correctFormId) {
    // imperatively send the request without action route (fetcher.submit() can't handle images even with multipart/formData as ecntype)
    // update image for wrongForm and correctForm exercise demo
    const file = event.target.files[0];
    const reader = new FileReader();
    const formData = new FormData();
    let response;
    reader.onloadend = async () => {
      formData.append('demo', file);
      try {
        if (wrongFormId != null) {
          response = await updateWrongExerciseForm(wrongFormId, formData);
        } else {
          response = await updateCorrectExerciseForm(correctFormId, formData);
        }
        if (response.statusCode >= 400) {
          throw new Error(response);
        }
      } catch (error) {
        console.error('An error occured', error);
        setIsError(true);
      }
      updateAccordions((draft) => {
        const accordion = draft.find((a) => a.id === accordionId);
        const accordionItem = accordion.items.find((i) => i.id === itemId);
        const workout = accordionItem.workouts.find((w) => w.id === workoutId);
        // check if it's from a wrongForm card
        if (wrongFormId != null) {
          const wrongForm = workout.wrongForm.find((w) => w.id === wrongFormId);
          wrongForm.demo = reader.result;
        } else {
          // then it's from a correctForm card
          const correctForm = workout.correctForm.find(
            (w) => w.id === correctFormId
          );
          correctForm.demo = reader.result;
        }
      });
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  }

  async function handleDeleteCard(workoutId, wrongFormId, correctFormId) {
    let response;
    try {
      if (wrongFormId != null) {
        response = await deleteWrongExerciseForm(wrongFormId);
      } else {
        response = await deleteCorrectExerciseForm(correctFormId);
      }

      if (response.statusCode >= 400) {
        throw new Error(response);
      }
    } catch (error) {
      console.error(error);
      setIsError(true);
    }
    updateAccordions((draft) => {
      const accordion = draft.find((a) => a.id === accordionId);
      const accordionItem = accordion.items.find((i) => i.id === itemId);
      const workout = accordionItem.workouts.find((w) => w.id === workoutId);

      if (wrongFormId != null) {
        workout.wrongForm = workout.wrongForm.filter(
          (w) => w.id !== wrongFormId
        );
      } else {
        workout.correctForm = workout.correctForm.filter(
          (w) => w.id !== correctFormId
        );
      }
    });
  }

  // handles the description change of correctFrom and wrongForm in their respective cards.
  async function handleChangeDescription(description, card, workoutId, id) {
    let response;
    try {
      const formData = new FormData();
      formData.append('description', description);
      // if it comes from wrongFormMediaCard
      if (card === 'wrongForm') {
        response = await updateWrongExerciseForm(id, formData);
        // if it comes from correctFormMediaCard
      } else {
        response = await updateCorrectExerciseForm(id, formData);
      }
      if (response.statusCode >= 400) {
        throw new Error(response);
      }
    } catch (error) {
      console.error('An error occured', error);
      setIsError(true);
    }
    updateAccordions((draft) => {
      const accordion = draft.find((a) => a.id === accordionId);
      const accordionItem = accordion.items.find((i) => i.id === itemId);
      const workout = accordionItem.workouts.find((w) => w.id === workoutId);

      // we check if this came from WorkoutMediaWrongFormCard
      if (card === 'wrongForm') {
        const wrongForm = workout.wrongForm.find((w) => w.id === id);
        wrongForm.description = description;
        // if not, its from WorkoutMediaCorrectFormCard
      } else {
        const correctForm = workout.correctForm.find((w) => w.id === id);
        correctForm.description = description;
      }
    });
  }

  //handles the addition of correctForm and wrongForm cards in their respective dialogs.
  function handleAddCard(formDialog, workoutId) {
    const formData = new FormData();
    let response;
    // append also a default example image
    fetch(demoGif2)
      .then((res) => res.blob())
      .then(async (blob) => {
        const file = new File([blob], 'chinUp.gif', {
          type: 'image/png',
        });
        formData.append('demo', file);
        if (formDialog === 'wrongForm') {
          formData.append(
            'description',
            'Wrong exercise form description: e.g., Shoulder blades not retracting'
          );
          response = await createWrongExerciseForm(workoutId, formData);
        } else {
          formData.append(
            'description',
            'Correct exercise form description: e.g., Shoulder blades are depressed downwards'
          );
          response = await createCorrectExerciseForm(workoutId, formData);
        }

        if (response.statusCode >= 400) {
          throw new Error(workout);
        }
        return response;
      })
      .then((response) => {
        updateAccordions((draft) => {
          const accordion = draft.find((a) => a.id === accordionId);
          const accordionItem = accordion.items.find((i) => i.id === itemId);
          const workout = accordionItem.workouts.find(
            (w) => w.id === workoutId
          );

          // we check if this came from WrongformDialog
          if (formDialog === 'wrongForm') {
            workout.wrongForm.push(response);
            // if not, its from CorrectFormDialog
          } else {
            workout.correctForm.push(response);
          }
        });
      })
      .catch((err) => {
        console.error(`An error occured`, err);
        setIsError(true);
      });
  }

  const handleClickOpen = (btn) => {
    if (btn === 'correct') {
      setisOpenCorrect(true);
    } else {
      setisOpenWrong(true);
    }
  };

  return (
    open && (
      <>
        <Card
          data-cy='Workout Card'
          sx={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: { xs: 350, sm: 400 },
            maxHeight: { xs: 700, md: 725 },
            height: '100%',
            borderTop: `4px solid #FFC55C`,
          }}
        >
          <CardMedia
            component='img'
            sx={{ aspectRatio: 16 / 9 }}
            src={workout.demo}
            alt='workout demo'
          />
          <InputFileUpload
            workoutId={workout.id}
            onChange={onChangeImage}
            name='demo'
            text='GIF File'
          />
          {isError && (
            <Typography
              variant='small'
              sx={{ color: 'red', textAlign: 'center', mt: 1 }}
            >
              Something Happend.Please try again
            </Typography>
          )}
          <CardContent>
            <Box width='inherit' component={'div'}>
              {/* workout description editor */}
              <ReactQuill
                modules={modulesCard}
                onChange={(value) => {
                  setWorkoutDescription(value);
                  setIsError(false);
                }}
                value={workoutDescription}
                className={isError ? 'ql-workout ql-error' : 'ql-workout'}
              />
            </Box>
          </CardContent>
          <CardActions sx={{ marginTop: 'auto' }}>
            <Grid
              container
              justifyContent={'center'}
              columns={{ xs: 4, sm: 8 }}
              spacing={2}
            >
              <Grid item xs={4} sm={4}>
                <Button
                  onClick={() => handleClickOpen('correct')}
                  startIcon={<CheckIcon color='success' />}
                  color='success'
                  fullWidth={true}
                  variant='outlined'
                  size='large'
                >
                  Form
                </Button>
                <CorrectFormDialog
                  errorState={{ isError, setIsError }}
                  eventHandlers={{
                    handleImageUpload,
                    handleDeleteCard,
                    handleChangeDescription,
                    handleAddCard,
                  }}
                  workoutId={workout.id}
                  correctFormExercises={workout.correctForm}
                  open={isOpenCorrect}
                  setOpen={setisOpenCorrect}
                />
              </Grid>
              <Grid item xs={4} sm={4}>
                <Button
                  onClick={() => handleClickOpen('wrong')}
                  startIcon={<ClearIcon color='error' />}
                  color='error'
                  fullWidth={true}
                  variant='outlined'
                  size='large'
                >
                  Form
                </Button>
                <WrongFormDialog
                  errorState={{ isError, setIsError }}
                  eventHandlers={{
                    handleImageUpload,
                    handleDeleteCard,
                    handleChangeDescription,
                    handleAddCard,
                  }}
                  workoutId={workout.id}
                  wrongFormExercises={workout.wrongForm}
                  open={isOpenWrong}
                  setOpen={setisOpenWrong}
                />
              </Grid>
              <Grid item sm={8}>
                <Button
                  fullWidth={true}
                  onClick={() => onClick(workout.id)}
                  startIcon={<DeleteIcon />}
                >
                  Delete
                </Button>
              </Grid>
            </Grid>
          </CardActions>
        </Card>
      </>
    )
  );
}
