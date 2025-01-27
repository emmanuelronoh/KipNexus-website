import { fn } from '@storybook/test';
import InputFileUpload from '../components/InputFileUpload';

const meta = {
  component: InputFileUpload,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  args: { onChange: fn() },

};

export default meta;

/** This is being rendered in the create-course or edit-course route when the stepper is 0 */
export const Default = {
  args: {
    thumbnail: null, name: "thumbnail", text: "Image"
  }
};

/** This is being rendered in the create-course or edit-course route when the stepper is 2, and there's a workout media card being rendered when you open the accordion item's dialog.*/
export const Workout = {
  args: {
    workoutId: 0, name: "demo", text: "GIF File"
  }
}
/** Similar to the Workout. This is being rendered in the create-course or edit-course route when the stepper is 2, and there's a workout media card (correct form) being rendered when click the correct form btn.*/
export const CorrectFormExercise = {
  args: {
    correctFormId: 0, workoutId: 0, name: "demo", text: "GIF File"
  }
}
/** Similar to the Workout. This is being rendered in the create-course or edit-course route when the stepper is 2, and there's a workout media card (wrong form) being rendered when click the wrong form btn.*/
export const wrongFormExercise = { 
  args: {
    wrongFormId: 0, workoutId: 0, name: "demo", text: "GIF File"
  }
}