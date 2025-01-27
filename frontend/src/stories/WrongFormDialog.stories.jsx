import { fn } from '@storybook/test';
import WrongFormDialog from '../components/WrongFormDialog';
import pullup from '/images/chinupVecs.gif'
import pushup from '/images/pushupVecs.gif'

const meta = {
  component: WrongFormDialog,
};

export default meta;

/** Rendered when the correct form button of workout is clicked */
export const Default = {
  args: {
    wrongFormExercises: [{
      workout: 0,
      description: `<h4>An example would be this: </h4>
      <p>shoulders shrugging</p>`,
      demo: pushup
    },
    {
      workout: 0,
      description: `<h4> An example would be this: </h4>
      <p>flaring your elbows out</p>`,
      demo: pullup
    }
    ], open: true, setOpen: fn()
  }
};