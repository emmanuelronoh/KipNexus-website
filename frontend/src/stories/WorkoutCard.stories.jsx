import { fn } from '@storybook/test';
import WorkoutCard from '../components/WorkoutCard';
import demo from '/images/chinupVecs.gif'

const meta = {
  component: WorkoutCard,
  tags: ['autodocs']
};

export default meta;

/** This is being rendered in the create-course and edit-course routes, primarily in the accordion item dialog (workout routine section). ReactQuill is broken here in the storybook.*/
export const Default = {
  args: {
    ids: { accordionId: 0, itemId: 0 }, immerAtom: [,fn()] , onChangeImage: fn(), onChangeDescription: fn(), onClick: fn(), workout: {id: 0, description : "you know this is just gonna be broken because it's in react quill", demo: demo}, open: true
  }
};