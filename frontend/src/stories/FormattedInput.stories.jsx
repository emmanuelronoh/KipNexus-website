import { fn } from '@storybook/test';
import FormattedInput from '../components/FormattedInput';

const meta = {
  component: FormattedInput,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

/** This is being rendered in create-course route and edit-course route*/
export const Default = {
  args: {
    course: {
      id: 0,
      title: '',
      difficulty: '',
      description: '',
      thumbnail: null,
      price: 0,
      weeks: '',
      isFirstView: true

    },
    setCourse: fn()
  }
};