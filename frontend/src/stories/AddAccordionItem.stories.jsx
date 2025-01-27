import { fn } from '@storybook/test';
import AddAccordionItem from '../components/AddAccordionItem';

const meta = {
  component: AddAccordionItem,
  tags: ['autodocs'],
  args: { onClick: fn() },

};

export default meta;

/** Similar to the Add Accordion, but this one is for adding accordion items or details. This is rendered when the accordion that is the parent component is expanded.*/
export const Default = {
  args: {
    actionData: {
      message: "{\"heading\":[\"This field may not be blank.\"]}"
    },
    accordionId: 'arbitary number'
  }
};