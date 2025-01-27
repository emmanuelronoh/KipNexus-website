import { fn } from '@storybook/test';
import DifficultySelectForm from '../components/DifficultySelectForm';

const meta = {
  component: DifficultySelectForm,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],

};

export default meta;

/** This is being rendered in create course and edit course route */
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
    isError: true,
    course: {
      "id": 0,
      "title": "",
      "difficulty": "",
      "description": "",
      "thumbnail": null,
      "price": 0,
      "weeks": "",
      "isFirstView": true
    }
  }
};