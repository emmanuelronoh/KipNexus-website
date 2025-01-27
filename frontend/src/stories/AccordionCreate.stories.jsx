import { fn } from "@storybook/test";
import { AccordionSectionCreate } from "../components/Accordion";
import { ResponsiveDialog as AccordionItemDialogCreate } from "../components/AccordionItem";
import { action } from "@storybook/addon-actions";

const meta = {
  component: AccordionSectionCreate,
  subcomponent: { AccordionItemDialogCreate },
  tags: ['autodocs'],
};

export default meta;

/** Accordion component in the create-course route & edit-course route, when creating or editing a course */
export const AccordionCreate = {
  render: ({ ...args }) => {
    const accordions = args.accordion;
    const updateAccordions = fn();
    return (
      <AccordionSectionCreate {...args}>
        {
          args.accordion.items.map(item => (
            <AccordionItemDialogCreate
              actionData={args.actionData}
              immerAtom={[accordions, updateAccordions]}
              itemId={item.id}
              onClick={action('onClickDeleteItem')}
              onChange={action('onChangeItem')}
              accordionId={args.accordion.id}
              accordionItem={item}
            >{item.heading}</AccordionItemDialogCreate>
          ))
        }
      </AccordionSectionCreate >
    )
  },
  args: {
    actionData: {
      message: ''
    },
    eventHandlers: {
      handleDeleteAccordionItem: fn(),
      handleEditAccordionItem: fn(),
      handleAddAccordionItem: fn(),
    },
    onClickDelete: fn(),
    onChange: fn(),
    handleChange: fn(),
    expanded: true,
    accordion: {
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
    },
  },
};