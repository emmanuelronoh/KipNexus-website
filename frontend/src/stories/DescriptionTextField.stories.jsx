import { fn } from '@storybook/test';
import DescriptionTextField from '../components/DescriptionTextField';

const meta = {
  component: DescriptionTextField,
  tags: ['autodocs']
};

export default meta;

/** This broken idk, reactquill is not stable here in storybook */
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

    }, setCourse: fn(), actionData: {

    }
  }
};