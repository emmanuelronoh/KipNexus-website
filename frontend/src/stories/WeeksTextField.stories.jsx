import { fn } from '@storybook/test';
import WeeksTextField from '../components/WeeksTextField';

const meta = {
  component: WeeksTextField,
  tags: ['autodocs'],
  parameters : {
    layout: 'centered'
  }
};

export default meta;

/** This is being rendered in create-course and edit-course route */
export const Default = {
  args: {
    isError: false, setIsError: fn(), course: {
      id: 0,
      title: '',
      difficulty: '',
      description: '',
      thumbnail: null,
      price: 0,
      weeks: '',
      isFirstView: true

    }, setCourse: fn()
  }
}; 

export const Error = {
  args: {
    isError: true, setIsError: fn(), course: {
      id: 0,
      title: '',
      difficulty: '',
      description: '',
      thumbnail: null,
      price: 0,
      weeks: '',
      isFirstView: true

    }, setCourse: fn()
  }
};