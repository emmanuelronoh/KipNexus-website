// import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import MobileStepper from '@mui/material/MobileStepper';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { useFormAction } from 'react-router-dom';
import { useAtom } from 'jotai';
import { isErrorAtom } from '../atoms/isErrorAtom';

// stepper is responsible also for submission of our FORMS
export default function ProgressMobileStepper({
  intent,
  setIntent,
  activeStep,
  setActiveStep,
}) {
  const [isError] = useAtom(isErrorAtom);
  const theme = useTheme();

  function handleBack() {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setIntent('update'); // The user's intent is always going to be edit mode when clicking the back button.
  }

  return (
    <MobileStepper
      variant='progress'
      steps={3}
      position='static'
      activeStep={activeStep}
      sx={{ maxWidth: 'inherit', flexGrow: 1 }}
      nextButton={
        <Button
          name='intent'
          value={intent}
          data-cy='nextButton'
          size='small'
          type='submit'
          disabled={activeStep === 2 || isError}
        >
          {intent === 'update' ? 'Save' : 'Next'}
          {theme.direction === 'rtl' ? (
            <KeyboardArrowLeft />
          ) : (
            <KeyboardArrowRight />
          )}
        </Button>
      }
      backButton={
        <Button
          data-cy='prevButton'
          size='small'
          type='button'
          disabled={activeStep === 0 || isError}
          onClick={handleBack}
        >
          Back
          {theme.direction === 'rtl' ? (
            <KeyboardArrowRight />
          ) : (
            <KeyboardArrowLeft />
          )}
        </Button>
      }
    />
  );
}
