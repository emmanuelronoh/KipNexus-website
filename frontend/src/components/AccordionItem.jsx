import { useAutoAnimate } from '@formkit/auto-animate/react';
import {
  Box,
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
  responsiveFontSizes,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import * as React from 'react';
import { createWorkout, deleteWorkout, updateWorkout } from '../courses';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import {
  YoutubeInput,
  DescriptionInput,
} from '../components/LectureReadMeTextFields';
import WorkoutMediaCard from './WorkoutCard';
import getEmbedUrl from '../helper/getEmbedUrl';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import demoGif from '/images/chinupVecs.gif';
import InputFileUpload from './InputFileUpload';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';

let theme = createTheme();
theme = responsiveFontSizes(theme);

// Event handlers in RepsonsiveDialog don't use the Submit hook anymore (because I am lazy about refactoring the logic, and it's added complexity to revise and use the Effect hook for it (probably not a good idea either)) to send it to our action server. Instead, it just now calls the function that makes the HTTP request inside the event handler.
export function ResponsiveDialog({
  actionData,
  immerAtom,
  itemId,
  onClick,
  onChange,
  accordionId,
  accordionItem,
  children,
}) {
  // This compponent (ResponsiveDialog) is actually an Accordion item or detail of an accordion
  const [isError, setIsError] = React.useState(false);
  const [, updateAccordions] = immerAtom; // lol this is just a prop from the parent component (AccordionSection)
  const [open, setOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [parent, enableAnimations] = useAutoAnimate();
  const [isWorkoutRoutine, setIsWorkoutRoutine] = React.useState(
    accordionItem?.workouts?.length > 0
  );
  const [heading, setHeading] = React.useState(children);
  // The `lecture` and `description` state variable holds the *first* value of `accordionItem.lecture` for lecture and `accordItem.description` for description.
  // Further changes to both `accordionItem` prop are ignored.
  const [lecture, setLecture] = React.useState(accordionItem?.lecture || '');
  const [description, setDescription] = React.useState(
    accordionItem?.description || ''
  );
  const theme2 = useTheme();
  const fullScreen = useMediaQuery(theme2.breakpoints.down('sm'));
  let accordionItemHeadingContent;
  const isFirstRender = React.useRef(true);
  const initialDescription = React.useRef(description);
  const initialLecture = React.useRef(lecture); // necessary variables to avoid this side effect from running on the first render

  React.useEffect(() => {
    if (actionData?.message) {
      // if there's a message from action server. then there's an error
      setIsError(true);
    }
  }, [actionData]);

  React.useEffect(() => {
    if (isEditing) {
      // debounce event handler
      const handler = setTimeout(() => {
        onChange(
          {
            ...accordionItem,
            heading: heading,
          },
          accordionId
        );
        setIsError(false);
      }, 300);
      return () => {
        clearTimeout(handler);
      };
    }
    if (!isWorkoutRoutine) {
      if (
        isFirstRender.current ||
        (description === initialDescription.current &&
          lecture === initialLecture.current)
      ) {
        isFirstRender.current = false;
        return;
      }
      // debounce event handler
      const handler = setTimeout(() => {
        onChange(
          {
            ...accordionItem,
            description: description,
            lecture: lecture,
          },
          accordionId
        );
        setIsError(false);
      }, 300);
      return () => {
        clearTimeout(handler);
      };
    }
  }, [heading, lecture, description]);

  function handleImageUpload(event, workoutId) {
    // update image for workout demo
    const file = event.target.files[0];
    const reader = new FileReader();
    const formData = new FormData();
    reader.onloadend = async () => {
      try {
        formData.append('demo', file);
        const workoutRes = await updateWorkout(workoutId, formData);
        // throw an error if !response.ok
        if (workoutRes.statusCode >= 400) {
          throw new Error(workoutRes);
        }
        setIsError(false);
      } catch (err) {
        console.error('An error occured', err);
        setIsError(true);
      }
      updateAccordions((draft) => {
        const accordion = draft.find((a) => a.id === accordionId);
        const accordionItem = accordion.items.find((i) => i.id === itemId);
        const workout = accordionItem.workouts.find((w) => w.id === workoutId);
        workout.demo = reader.result;
      });
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  }

  async function handleChangeWorkoutDescription(workoutDescription, workoutId) {
    const formData = new FormData();
    formData.append('exercise', workoutDescription);
    try {
      const w = await updateWorkout(workoutId, formData);
      if (w.statusCode >= 400) {
        throw new Error(w);
      }
    } catch (error) {
      console.error('An Error Occured', error);
    }
    updateAccordions((draft) => {
      const accordion = draft.find((a) => a.id === accordionId);
      const accordionItem = accordion.items.find((i) => i.id === itemId);
      const workout = accordionItem.workouts.find((w) => w.id === workoutId);
      workout.exercise = workoutDescription;
    });
  }

  function handleAddWorkoutCard() {
    setIsError(false);
    const workoutFormData = new FormData();
    workoutFormData.append('exercise', 'Your description here');
    // append also a default example image
    fetch(demoGif)
      .then((res) => res.blob())
      .then(async (blob) => {
        const file = new File([blob], 'chinUp.gif', {
          type: 'image/png',
        });
        workoutFormData.append('demo', file);
        const workout = await createWorkout(itemId, workoutFormData);
        if (workout.statusCode >= 400) {
          throw new Error(workout);
        }
        return workout;
      })
      .then((workout) => {
        updateAccordions((draft) => {
          const accordion = draft.find((a) => a.id === accordionId);
          const accordionItem = accordion.items.find(
            (item) => item.id === itemId
          );
          accordionItem.workouts.push({
            id: workout.id,
            exercise: `
                        <h3> Your description here e.g., </h3><br>
                        <p> Chin Ups setsXreps: 3x8 </p> <br>
                        <p> Rest: 2 minutes </p> <br>
                        <p> tempo: 1 sec concentric (upward movement)</p> <br>
                        <p> 2 sec eccentric (downward movement) </p>
                        <p> exertion: 8 </p> etc`,
            demo: demoGif,
            correctForm: [],
            wrongForm: [],
          });
        });
      })
      .catch((err) => {
        console.error(`An error occured`, err);
        setIsError(true);
      });
  }

  async function handleDeleteWorkoutCard(workoutId) {
    try {
      const workout = await deleteWorkout(workoutId);
      if (workout.statusCode >= 400) {
        throw new Error(workout);
      }
    } catch (error) {
      console.error(error);
    }
    updateAccordions((draft) => {
      const accordion = draft.find((a) => a.id === accordionId);
      const accordionItem = accordion.items.find((i) => i.id === itemId);
      accordionItem.workouts = accordionItem.workouts.filter(
        (w) => w.id !== workoutId
      );
    });
  }

  if (isEditing) {
    // show input form when edit btn is clicked
    accordionItemHeadingContent = (
      <>
        <Grid item xs={10} lg={11}>
          {/* AccordtionDetail edit input form */}
          <TextField
            error={isError}
            data-cy={`Accordion item edit-${itemId}`}
            id='standard-multiline-flexible'
            label='Accordiong Item Heading'
            multiline
            maxRows={4}
            variant='standard'
            value={heading}
            fullWidth
            onChange={(e) => {
              setHeading(e.target.value);
            }}
          />
        </Grid>
        <Grid item xs={2} lg={1}>
          <Button onClick={() => setIsEditing(false)} disabled={isError}>
            Save
          </Button>
        </Grid>
      </>
    );
  } else {
    const handleClickOpen = () => {
      setOpen(true);
    };

    // show content when not in edit mode
    accordionItemHeadingContent = (
      <>
        <Grid item xs={10} lg={11}>
          <ThemeProvider theme={theme}>
            <DescriptionIcon
              theme={theme2}
              sx={{ marginRight: 1 }}
              fontSize='x-small'
            ></DescriptionIcon>
            <Typography
              data-cy={`Accordion item ${itemId}`}
              align='justify'
              variant='body'
              onClick={handleClickOpen}
              sx={{
                width: '100%',
                wordBreak: 'break-word',
                cursor: 'pointer',
                '&:hover': { color: 'lightgray' },
              }}
            >
              {children}
            </Typography>
          </ThemeProvider>
        </Grid>
        {itemId !== 1 && itemId !== 2 && (
          <Grid item xs={2} lg={1}>
            <Button
              data-cy={`accordionItem edit-${itemId}`}
              onClick={() => setIsEditing(true)}
              size='small'
              endIcon={!isEditing ? <EditIcon /> : null}
            ></Button>
            <Button
              onClick={() => onClick(accordionId, itemId)}
              size='small'
              endIcon={!isEditing ? <DeleteIcon /> : null}
            ></Button>
          </Grid>
        )}
      </>
    );
  }

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Grid container alignItems={'center'}>
        {accordionItemHeadingContent}
      </Grid>

      {/* don't render the first accordion items (they are just examples) */}

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
            justifyContent={'center'}
            marginLeft={{ md: 2 }}
            marginRight={{ md: 2 }}
          >
            <DialogTitle id='responsive-dialog-title'>
              <ButtonGroup disableElevation aria-label='button group'>
                <Button
                  onClick={() => setIsWorkoutRoutine(true)}
                  variant={isWorkoutRoutine ? 'contained' : 'outlined'}
                >
                  Workout Routine
                </Button>
                <Button
                  onClick={() => setIsWorkoutRoutine(false)}
                  variant={isWorkoutRoutine ? 'outlined' : 'contained'}
                >
                  Video Lecture / Readme
                </Button>
              </ButtonGroup>
            </DialogTitle>
          </Grid>
          <Grid
            item
            container
            justifyContent={'center'}
            marginLeft={{ md: 2 }}
            marginRight={{ md: 2 }}
          >
            <DialogContent>
              {isWorkoutRoutine ? (
                <>
                  <Grid
                    ref={parent}
                    justifyContent={{ xs: 'center', sm: 'flex-start' }}
                    item
                    container
                    rowSpacing={2}
                    columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                    columns={12}
                  >
                    {accordionItem.workouts?.map((workout) => (
                      // Renders Workout instance
                      <Grid key={workout.id} item sm={6}>
                        {/* Provider will provide context in which WorkoutMediaCard, can access an independent atom that it can be use */}
                        <WorkoutMediaCard
                          ids={{ accordionId, itemId }}
                          immerAtom={immerAtom}
                          onChangeImage={handleImageUpload}
                          onChangeDescription={handleChangeWorkoutDescription}
                          onClick={handleDeleteWorkoutCard}
                          workout={workout}
                          open={open}
                        >
                          {' '}
                        </WorkoutMediaCard>
                      </Grid>
                    ))}
                    <Grid item sm={6}>
                      {/* add WorkoutMediaCard / Workout button */}
                      <Button
                        disabled={itemId === 1 || itemId === 2}
                        data-cy={`Add icon`}
                        onClick={() => handleAddWorkoutCard()}
                        sx={{
                          height: { xs: 250, sm: 622, md: 700 },
                          width: { xs: 340, sm: '100%', md: 391 },
                        }}
                      >
                        <AddIcon
                          fontSize='large'
                          sx={{ height: 300, width: 300 }}
                        />
                      </Button>
                    </Grid>
                    {/* {isError &&
                                                <Grid item sm={6} alignSelf={'center'}>
                                                    <Typography sx={{ color: 'red', textAlign: 'center', mb: 3, mt: 3 }}>Something Happend.Please try again</Typography>
                                                </Grid>
                                            } */}
                  </Grid>
                </>
              ) : (
                <Grid justifyContent={'center'} item container>
                  <YoutubeInput
                    isError={isError}
                    actionData={actionData}
                    lecture={lecture}
                    onChange={setLecture}
                    itemId={itemId}
                  />
                  <Grid item xs={10}>
                    <Box
                      mt={4}
                      className='course-preview-container'
                      component={'div'}
                    >
                      <Plyr
                        source={{
                          type: 'video',
                          sources: [
                            {
                              src: getEmbedUrl(accordionItem.lecture) || '',
                              provider: 'youtube',
                            },
                          ],
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item mt={4} xs={10} justifySelf={'flex-start'}>
                    <ThemeProvider theme={theme}>
                      <Typography variant='h4' fontWeight={'bold'}>
                        Description
                      </Typography>
                    </ThemeProvider>
                  </Grid>
                  <Grid item xs={10} mt={4}>
                    <DescriptionInput
                      isError={isError}
                      actionData={actionData}
                      description={description}
                      onChange={setDescription}
                      itemId={itemId}
                    />
                  </Grid>
                </Grid>
              )}
            </DialogContent>
          </Grid>
        </Grid>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
