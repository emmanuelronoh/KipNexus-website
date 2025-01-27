import { fn } from '@storybook/test';
import ProgressMobileStepper from '../components/ProgressMobileStepper';

const meta = {
  component: ProgressMobileStepper,
};

export default meta;

/** This is being rendered in the create-course and edit-course routes.*/
export const Default = {
  args: {
    intent: "next", setIntent: fn(), activeStep: 0, setActiveStep: fn()
  }
};

export const NextStep = {
  args: {
    intent: "next", setIntent: fn(), activeStep: 1, setActiveStep: fn()
  }
};
export const LastStep = {
  args: {
    intent: "next", setIntent: fn(), activeStep: 2, setActiveStep: fn()
  }
};