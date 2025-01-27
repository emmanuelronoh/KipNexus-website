import { fn } from '@storybook/test';
import OverviewTextField from '../components/OverviewTextField';

const meta = {
  component: OverviewTextField,
  tags: ['autodocs']
};

export default meta;

/** Still the same it's broken  */
export const Default = {
  args: {
    isError: false, setIsError: fn(), courseContent: {
      id: 0,
      preview: '',
      overview: '',
      isFirstView: true
    }, setCourseContent: fn(), actionData: {}
  }
};

