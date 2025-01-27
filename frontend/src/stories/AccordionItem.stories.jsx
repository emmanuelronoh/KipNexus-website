import { fn } from '@storybook/test';
import { ResponsiveDialog } from '../components/AccordionItem';
import { action } from '@storybook/addon-actions';

const meta = {
  component: ResponsiveDialog,
  tags: ['autodocs'],
  parameters: {

    layout: 'centered',
  },
};

export default meta;

/** 
This is being rendered in the create-course route, where the accordion item component is visible when the accordion is expanded. (I can't seem to render both the accordion and the items in the story.)
My ReactQuill component is broken here in the storybook only.
*/
export const Default = {
  args: {
    actionData: {},
    immerAtom: [[{
      id: 1,
      heading: 'This is an example Accordion here of a course content',
      items: [
        {
          id: 2,
          heading: 'This is an accordion item',
          description: 'Empty',
          workouts: [],
          lecture: ''
        }
      ]
    }], fn()],
    itemId: null,
    onClick: fn(),
    onChange: fn(),
    accordionId: 1,
    accordionItem: {
      id: 2,
      heading: 'This is an accordion item',
      description: 'idk my react quill editor is broken in here ',
      workouts: [],
      lecture: 'https://www.youtube.com/watch?v=ZFBP4549A1s'
    },
    children: 'This is an example Accordion item or detail of a section/accordion',
  },
};


// This is being rendered in the create-course and edit-course route, where the accordion item component is visible when the accordion is expanded.
/** When you try to edit the heading you'll get this UI error */
export const Error = {
  args: {
    actionData: {
      "statusCode": 400,
      message: "{\"heading\":[\"This field may not be blank.\"]}"
    },
    immerAtom: [[{
      "id": 1,
      "heading": "",

      "items": [{
        "id": 2,
        "heading": "This is an accordion item",
        "description": "Empty",
        "workouts": [],
        "lecture": ""
      }]
    }], null],
    itemId: null,
    accordionId: 1,
    accordionItem: {
      "id": 2,
      "heading": "This is an accordion item",
      "description": "idk my react quill editor is broken in here ",
      "workouts": [],
      "lecture": "https://www.youtube.com/watch?v=ZFBP4549A1s"
    },
    children: "Can't be empty"
  }
};


