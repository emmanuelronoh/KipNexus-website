import { fn } from '@storybook/test';
import AddAccordion from '../components/AddAccordion';

const meta = {
  component: AddAccordion,
  tags: ['autodocs'],
  args: { onClick: fn() },

};

export default meta;

/**  
This is being rendered in the create-course & edit-course route in the course content for creating accordions.
*/
export const Default = {
  args: {
    actionData: {
      message: "{\"heading\":[\"This field may not be blank.\"]}"
    }
  }
};
