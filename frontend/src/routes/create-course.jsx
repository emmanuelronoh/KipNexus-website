import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  Fab,
  FormControl,
  Grid,
  Grow,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
  responsiveFontSizes,
} from '@mui/material';
import * as React from 'react';
import image from '/images/noimg.png';
import { styled } from '@mui/material/styles';
import { useImmer } from 'use-immer';
import DeleteIcon from '@mui/icons-material/Delete';
import getEmbedUrl from '../helper/getEmbedUrl';
import FormattedInputs from '../components/FormattedInput';
import AddAccordion from '../components/AddAccordion';
import InputFileUpload from '../components/InputFileUpload';
import { AccordionSectionCreate } from '../components/Accordion';
import AddIcon from '@mui/icons-material/Add';
import demoGif from '/images/chinupVecs.gif';
import demoGif2 from '/images/pushupVecs.gif';
import { TransitionGroup } from 'react-transition-group';
import Collapse from '@mui/material/Collapse';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import ProgressMobileStepper from '../components/ProgressMobileStepper';
import {
  createCorrectExerciseForm,
  createCourse,
  createCourseContent,
  createSection,
  createSectionItem,
  createWorkout,
  createWrongExerciseForm,
  deleteCorrectExerciseForm,
  deleteSection,
  deleteSectionItem,
  deleteWorkout,
  deleteWrongExerciseForm,
  getSection,
  getSectionItems,
  getWorkouts,
  updateCorrectExerciseForm,
  updateCourse,
  updateCourseContent,
  updateSection,
  updateSectionItem,
  updateWorkout,
  updateWrongExerciseForm,
} from '../courses';
import {
  Form,
  redirect,
  useActionData,
  useFetcher,
  useNavigation,
  useSubmit,
} from 'react-router-dom';
import determineIntent from '../helper/determineIntent';
import { Provider, atom, useAtom } from 'jotai';

import { useImmerAtom } from 'jotai-immer';
import { accordionsAtom } from '../atoms/accordionsAtom';
import { isErrorAtom } from '../atoms/isErrorAtom';
import 'react-quill/dist/quill.snow.css';
import { snackbarReducerAtom } from '../atoms/snackbarAtom';
import AlertDialog from '../components/AreYouSureDialog';
import OverviewTextField from '../components/OverviewTextField';
import PreviewCourseTextField from '../components/PreviewCourseTextField';
import DifficultySelectForm from '../components/DifficultySelectForm';
import WeeksTextField from '../components/WeeksTextField';
import CourseTitleTextField from '../components/CourseTitleTextField';
import DescriptionTextField from '../components/DescriptionTextField';

let theme = createTheme();
theme = responsiveFontSizes(theme);

export async function action({ request }) {
  let formData = await request.formData();
  let course, courseContent, section, sectionItem, workouts;
  let sectionItems = [];
  let error = {};
  let intent = formData.get('intent');

  switch (parseInt(formData.get('activeStep'))) {
    case 0:
      // create a course
      if (intent === 'create') {
        course = await createCourse(formData);
      }
      // update a course
      if (intent === 'update') {
        course = await updateCourse(formData.get('courseId'), formData);
      }
      // return error if there's an error
      if (course?.statusCode) {
        if (course.statusCode >= 400) {
          error = { ...course };
          return error;
        }
      }
      break;
    case 1:
      // create a course's overview
      let courseId = formData.get('courseId');
      if (intent === 'create') {
        courseContent = await createCourseContent(courseId, formData);
      }
      // update a course's overview
      if (intent === 'update') {
        courseContent = await updateCourseContent(courseId, formData);
      }
      if (courseContent?.statusCode) {
        if (courseContent.statusCode >= 400) {
          error = { ...courseContent };
          return error;
        }
      }
      break;
    case 2:
      // create/update a section / accordion (course's content)
      let sectionId = formData.get('sectionId');
      let sectionItemId = formData.get('sectionItemId');
      switch (intent) {
        case 'createAccordion':
          let courseContentId = formData.get('courseContentId');
          section = await createSection(courseContentId, formData);
          sectionItems = await getSectionItems(section.id);
          if (section?.statusCode) {
            if (section.statusCode >= 400) {
              error = { ...section };
              error.accordion = true;
              return error;
            }
          }
          break;
        case 'updateAccordion':
          section = await updateSection(sectionId, formData);
          sectionItems = await getSectionItems(section.id);
          if (section?.statusCode) {
            if (section.statusCode >= 400) {
              error = { ...section };
              return error;
            }
          }
          break;
        case 'deleteAccordion':
          section = await deleteSection(sectionId);
          if (section?.statusCode) {
            if (section.statusCode >= 400) {
              error = { ...section };
              return error;
            }
          }
          break;
        case 'createAccordionItem':
          section = await getSection(sectionId);
          sectionItem = await createSectionItem(sectionId, formData);
          workouts = await getWorkouts(sectionItem.id);
          if (sectionItem?.statusCode) {
            if (sectionItem.statusCode >= 400) {
              error = { ...sectionItem };
              error.accordionItem = true;
              return error;
            }
          }
          sectionItem.workouts = workouts;
          sectionItems.push(sectionItem);
          break;
        case 'updateAccordionItem':
          section = await getSection(sectionId);
          sectionItem = await updateSectionItem(sectionItemId, formData);
          workouts = await getWorkouts(sectionItemId);
          if (sectionItem?.statusCode) {
            if (sectionItem.statusCode >= 400) {
              error = { ...sectionItem };
              return error;
            }
          }
          sectionItem.workouts = workouts;
          sectionItems.push(sectionItem);
          break;
        case 'deleteAccordionItem':
          sectionItem = await deleteSectionItem(sectionItemId);
          if (sectionItem?.statusCode) {
            if (sectionItem.statusCode >= 400) {
              error = { ...sectionItem };
              return error;
            }
          }
          break;
        case 'submit':
          let courseId = formData.get('courseId');
          formData.append('is_draft', false);
          course = await updateCourse(courseId, formData);
          if (course?.statusCode >= 400) {
            error = { ...course };
            return error;
          }
          return redirect('/');
      }
      section = {
        ...section,
        intent: intent,
        items: sectionItems, // Items will contain only '1' if it's either creating or updating an accordion item; if not, then it has more than 1.
        ...(section ? {} : { id: sectionId }), // adds an ID if we are deleting an accordion because the response will be empty for DELETE HTTP methods, i.e., 204 status code. And some of our logic depends on the section ID. so ActionData will only return an ID when an accordion is deleted.
      };
  }

  return { course, courseContent, section }; // only one obj property will persist i.e one returns a value other's are undefined
}

function ControlledAccordions({ activeStep, courseContentId }) {
  const [expanded, setExpanded] = React.useState(false);
  const fetcher = useFetcher();
  const actionData = fetcher.data; // returns the response from previous action
  // actionData will be pass to this component's childrens. because we are using fetcher here but for components up they don't
  const [accordions, updateAccordions] = useImmerAtom(accordionsAtom);

  React.useEffect(() => {
    // initially the accordion's IDs is not up to date with the database server,
    // so we continuously update our real 'IDs' and values of our state variables
    // that's why we use a useEffect for this matter.

    if (actionData?.section && actionData?.section?.intent) {
      if (actionData.section.intent === 'createAccordion') {
        const { intent, ...rest } = actionData.section;
        updateAccordions((draft) => {
          draft.push(rest);
        });
      } else if (actionData.section.intent === 'updateAccordion') {
        updateAccordions((draft) => {
          const accordionIndex = draft.findIndex(
            (accordion) => accordion.id === actionData.section.id
          );
          const { intent, ...rest } = actionData.section;
          draft[accordionIndex] = rest;
        });
      } else if (actionData.section.intent === 'createAccordionItem') {
        updateAccordions((draft) => {
          const accordion = draft.find(
            (accordion) => accordion.id === actionData.section.id
          );
          accordion?.items.push(actionData.section.items[0]);
        });
      } else if (actionData.section.intent === 'updateAccordionItem') {
        updateAccordions((draft) => {
          const accordion = draft.find(
            (accordion) => accordion.id === actionData.section.id
          );
          if (accordion) {
            const accordionItemIndex = accordion.items.findIndex(
              (item) => item.id === actionData.section.items[0].id
            );
            const nextAccordionItem = actionData.section.items[0];
            accordion.items[accordionItemIndex] = nextAccordionItem;
          }
        });
      }
    }
  }, [actionData]);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  function handleAddAccordionItem(heading, accordionId) {
    // adds a new accordion item (sectionItem)
    fetcher.submit(
      {
        heading: heading,
        activeStep: activeStep,
        sectionId: accordionId,
        intent: 'createAccordionItem',
      },
      {
        method: 'post',
      }
    );
  }

  function handleEditAccordionItem(nextAccordionItem, accordionId) {
    // edits an accordion item's heading / content (sectionItem)

    const data = {
      heading: nextAccordionItem.heading,
      description: nextAccordionItem.description,
      activeStep: activeStep,
      sectionItemId: nextAccordionItem.id,
      sectionId: accordionId,
      intent: 'updateAccordionItem',
    };

    if (nextAccordionItem.lecture) {
      data.lecture = nextAccordionItem.lecture;
    } else {
      data.lecture = '';
    }

    fetcher.submit(data, {
      method: 'post',
    });
  }

  function handleDeleteAccordionItem(accordionId, accordionItemId) {
    // deletes accordion item
    // imperatively submit the key/value pairs needed in action route
    fetcher.submit(
      {
        activeStep: activeStep,
        sectionItemId: accordionItemId,
        intent: 'deleteAccordionItem',
      },
      {
        method: 'post',
      }
    );
    updateAccordions((draft) => {
      const accordionIndex = draft.findIndex(
        (accordion) => accordion.id === accordionId
      );
      const accordionItemIndex = draft[accordionIndex].items.findIndex(
        (a) => a.id === accordionItemId
      ); // find the item's index to remove
      draft[accordionIndex].items.splice(accordionItemIndex, 1);
    });
  }
  function handleAddAccordion(heading) {
    // adds  a new accordion  (section)
    // imperatively submit the key/value pairs needed in action route

    fetcher.submit(
      {
        heading: heading,
        activeStep: activeStep,
        courseContentId: courseContentId,
        intent: 'createAccordion',
      },
      {
        method: 'post',
      }
    );
  }

  function handleEditAccordion(nextAccordion) {
    // edits accordion's heading
    // imperatively submit the key/value pairs needed in action route
    fetcher.submit(
      {
        heading: nextAccordion.heading,
        activeStep: activeStep,
        sectionId: nextAccordion.id,
        intent: 'updateAccordion',
      },
      {
        method: 'post',
      }
    );
  }

  function handleDeleteAccordion(accordionId) {
    // deletes accordion
    // imperatively submit the key/value pairs needed in action route
    fetcher.submit(
      {
        activeStep: activeStep,
        sectionId: accordionId,
        intent: 'deleteAccordion',
      },
      {
        method: 'post',
      }
    );
    updateAccordions((draft) => draft.filter((a) => a.id !== accordionId));
  }
  return (
    <>
      {/* Adds a new Accordion / Section  */}
      <AddAccordion actionData={actionData} onClick={handleAddAccordion} />
      <Box sx={{ display: 'block', ml: 'auto', mr: 'auto' }}>
        <ThemeProvider theme={theme}>
          <Typography variant='small'>
            Note: The examples here are not part of your content.Please ignore
            them to avoid confusion.
          </Typography>
        </ThemeProvider>
      </Box>
      <TransitionGroup>
        {accordions.map((accordion) => (
          <Collapse key={accordion.id}>
            {/* The collapse component's purpose is to transitionally remove the accordion. */}
            <AccordionSectionCreate
              actionData={actionData}
              eventHandlers={{
                handleDeleteAccordionItem,
                handleEditAccordionItem,
                handleAddAccordionItem,
              }}
              onClickDelete={handleDeleteAccordion}
              onChange={handleEditAccordion}
              handleChange={handleChange}
              expanded={expanded}
              accordion={accordion}
            />
          </Collapse>
        ))}
      </TransitionGroup>
    </>
  );
}

export default function CreateCourse() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [previewImage, setPreviewImage] = React.useState(null);
  const [course, setCourse] = React.useState({
    id: 0,
    title: '',
    difficulty: '',
    description: '',
    thumbnail: image,
    price: 0,
    weeks: '',
    isFirstView: true,
  });
  const [courseContent, setCourseContent] = React.useState({
    id: 0,
    preview: '',
    overview: '',
    isFirstView: true,
  });

  const fetcher = useFetcher();
  const actionData = fetcher.data; // The returned data (Obj properties) from the loader or action is stored here. Once the data is set, it persists on the fetcher even through reloads and resubmissions. - ReactRouter
  const [isError, setIsError] = useAtom(isErrorAtom);
  const [intent, setIntent] = React.useState('create');
  const navigation = useNavigation();
  const [, dispatch] = useAtom(snackbarReducerAtom);
  const submit = useSubmit();

  // Yes, I kind of admit this use effect is bad and will probably revise it. should've gone with an imperative submission with fetcher.submit().
  // However, there's also seems to be a problem with fetcher.submit(); it can't handle the image.
  React.useEffect(() => {
    // continuously update real time 'IDs' of our state variables
    // !resonse.ok then there's a message
    // optional chaining
    if (actionData?.message) {
      setIsError(true);
    }
    // persist the IDs state so that we can use it to sent to our api (/course/courseId/course-content, note: this rest endpoint requires courseId)
    else if (
      actionData?.course?.title &&
      actionData?.course?.description &&
      activeStep === 0
    ) {
      // returned value of previous action.
      setCourse({
        ...course,
        id: actionData.course.id,
        isFirstView: false,
      });
      // im assuming this is somewhere 200 status code so we move on to the next step
      const nextActiveStep = activeStep + 1;
      setActiveStep(nextActiveStep); //  mew activeStep is queued for next rerender that's why we use a variable 'nextActiveStep'
      // determineItent wether to update or create in which active step currently on and is first view for next render
      setIntent(determineIntent(courseContent.isFirstView, nextActiveStep));
    } else if (
      actionData?.courseContent?.preview &&
      actionData?.courseContent?.overview &&
      activeStep === 1
    ) {
      // returned value of previous action.
      setCourseContent({
        ...courseContent,
        id: actionData.courseContent.id,
        isFirstView: false,
      });
      // im assuming this is somewhere 200 status code so we move on to the next step
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setIntent('create');
    }
  }, [actionData]);

  React.useEffect(() => {
    // checks if all fields are filled by the user
    function checkFields() {
      if (activeStep === 0) {
        for (let key in course) {
          if (key != 'price' && (course[key] === '' || course[key] === null)) {
            return false;
          }
        }
      } else if (activeStep === 1) {
        for (let key in courseContent) {
          if (courseContent[key] === '') {
            return false;
          }
        }
      }

      return true;
    }
    if (checkFields()) {
      setIsError(false);
    }
  }, [course, courseContent]);

  function handleImageUpload(event) {
    const file = event.target.files[0];
    setCourse({
      ...course,
      thumbnail: file,
    });

    // read file for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  }

  function handleSubmit() {
    submit(
      {
        intent: 'submit',
        courseId: course.id,
        activeStep: activeStep,
      },
      { method: 'post' }
    );
    dispatch({
      type: 'submitted',
      text: `Course submitted! It's now under review (3-7 days). Thanks for your patience!`,
    });
  }

  return (
    <>
      <br></br>
      {activeStep === 0 ? (
        <fetcher.Form method='post' encType='multipart/form-data' noValidate>
          <input type='hidden' value={activeStep} name='activeStep' />
          <input type='hidden' value={course.id} name='courseId' />
          <Box m='3vw'>
            <Container>
              <Grid container mb={4}>
                <Grid item xs>
                  <ProgressMobileStepper
                    intent={intent}
                    setIntent={setIntent}
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                  />
                </Grid>
              </Grid>
              <Grid
                container
                sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}
                spacing={2}
              >
                {/* Paper starts here */}
                <Grid item xs sm md={5}>
                  <Paper
                    elevation={4}
                    sx={{
                      height: { xs: 'auto', md: isError ? 630 : 600 },
                      width: 'auto',
                      maxWidth: { md: 450 },
                      mb: '5%',
                    }}
                  >
                    <Grid item justifySelf={'center'}>
                      <Container
                        sx={{ padding: '4%', maxWidth: { xs: 700, md: 400 } }}
                        component='div'
                      >
                        <img
                          src={previewImage ? previewImage : image}
                          className='course-thumbnail'
                          style={{
                            objectFit:
                              course.thumbnail == image ? 'fill' : 'cover',
                            border: '1px dashed black',
                          }}
                        />
                      </Container>
                    </Grid>
                    <Grid
                      item
                      container
                      wrap='nowrap'
                      alignItems={'center'}
                      direction='column'
                      spacing={2}
                    >
                      <Grid item xs>
                        {/* Uploading  image file button  here */}
                        <InputFileUpload
                          thumbnail={course.thumbnail}
                          name='thumbnail'
                          text='Image'
                          onChange={handleImageUpload}
                        />
                      </Grid>
                      <Grid item xs lineHeight={'1.3em'}>
                        {isError &&
                          actionData?.message && ( // this is equivalent to saying if there's an error and actionData returns an error message
                            <>
                              {Object.entries(
                                JSON.parse(actionData.message)
                              ).map(([key, value]) => (
                                <Box key={key} component='div' p={'0 1.5em'}>
                                  <Typography
                                    key={key}
                                    variant='small'
                                    sx={{ color: 'red', textAlign: 'left' }}
                                  >
                                    {key === 'thumbnail' ||
                                    key === 'difficulty' ||
                                    key === 'price' ||
                                    key === 'weeks'
                                      ? `${key}: ${value[0]}`
                                      : key === 'detail'
                                        ? `${value}`
                                        : null}
                                  </Typography>
                                </Box>
                              ))}
                            </>
                          )}
                      </Grid>
                      <Grid item>
                        <FormattedInputs
                          error={isError}
                          course={course}
                          setCourse={setCourse}
                        />
                      </Grid>
                      <Grid item xs pb={4}>
                        {/* Select menu form */}
                        <DifficultySelectForm
                          isError={isError}
                          setIsError={setIsError}
                          course={course}
                          setCourse={setCourse}
                        />
                        <WeeksTextField
                          isError={isError}
                          setIsError={setIsError}
                          course={course}
                          setCourse={setCourse}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                {/* Paper ends here */}
                {/* title  & description starts here */}

                {/* <Grid item xs={12} sm={12} md lg> */}
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md
                  container
                  wrap='nowrap'
                  direction='column'
                >
                  <Grid item xs>
                    {/* Course title textarea input */}
                    <CourseTitleTextField
                      isError={isError}
                      setIsError={setIsError}
                      course={course}
                      setCourse={setCourse}
                      actionData={actionData}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    {/* Course Description input here */}
                    <DescriptionTextField
                      isError={isError}
                      setIsError={setIsError}
                      course={course}
                      setCourse={setCourse}
                      actionData={actionData}
                    />
                  </Grid>
                </Grid>
              </Grid>
              {/* </Grid> */}
            </Container>
          </Box>
        </fetcher.Form>
      ) : /* title  & description ends here */
      activeStep === 1 ? (
        <fetcher.Form method='post' encType='multipart/form-data' noValidate>
          <TextField type='hidden' value={activeStep} name='activeStep' />
          <TextField type='hidden' value={course.id} name='courseId' />
          <Box m='3vw'>
            <Container>
              <Grid container mb={4}>
                <Grid item xs>
                  <ProgressMobileStepper
                    intent={intent}
                    setIntent={setIntent}
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                  />
                </Grid>
              </Grid>
            </Container>
          </Box>
          <Box
            sx={{ marginLeft: 'auto', marginRight: 'auto' }}
            maxWidth={{ xs: '85vw', md: '69vw' }}
          >
            {/* title  & description ends here */}
            <Grid
              mt={'2%'}
              container
              direction={'column'}
              alignItems={'center'}
              spacing={3}
            >
              {/* course overview textarea input */}
              <OverviewTextField
                isError={isError}
                setIsError={setIsError}
                courseContent={courseContent}
                setCourseContent={setCourseContent}
                actionData={actionData}
              />
              <PreviewCourseTextField
                isError={isError}
                setIsError={setIsError}
                courseContent={courseContent}
                setCourseContent={setCourseContent}
                actionData={actionData}
              />
            </Grid>
          </Box>
        </fetcher.Form>
      ) : (
        <>
          <Box m='3vw'>
            <Container>
              <Grid container>
                <Grid item xs>
                  <ProgressMobileStepper
                    intent={intent}
                    setIntent={setIntent}
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                  />
                </Grid>
              </Grid>
            </Container>
          </Box>
          <Box sx={{ marginLeft: '3vw', marginRight: '3vw' }}>
            <Grid
              mt={'2%'}
              container
              direction={'column'}
              alignItems={'center'}
              spacing={3}
            >
              <Grid item width={{ xs: '100%', md: '69%' }}>
                <ThemeProvider theme={theme}>
                  <Typography variant='h4' fontWeight={'bold'}>
                    Course content
                  </Typography>
                </ThemeProvider>
              </Grid>
              <Grid item width={{ xs: '100%', md: '69%' }}>
                <ControlledAccordions
                  activeStep={activeStep}
                  courseContentId={courseContent.id}
                ></ControlledAccordions>
              </Grid>
            </Grid>
            {/* <TextField type="hidden" value={activeStep} name="activeStep" />
                                    <TextField type="hidden" value={course.id} name="courseId" /> */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <AlertDialog
                  onClickSubmit={handleSubmit}
                  intent='submitting course'
                />
              </Box>
            </Box>
          </Box>
        </>
      )}
    </>
  );
}
