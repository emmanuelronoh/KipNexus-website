import { fn } from "@storybook/test";
import CreateCorrectFormDialog from "../components/CreateCorrectFormDialog";
import { action } from "@storybook/addon-actions";
import pushup from "../static/images/pushupVecs.gif"
const meta = {
  component: CreateCorrectFormDialog,
  tags: ['autodocs']
};

export default meta;

export const Default = {
  args: {
    errorState: { isError: false, setIsError: action("setIsError") },
    eventHandlers: {
      handleImageUpload: fn(),
      handleDeleteCard: fn(),
      handleChangeDescription: fn(),
      handleAddCard: fn(),
    },
    workoutId: 0,
    correctFormExercises: [
      {
        id: 0,
        description : `<h4> IDK MY REACTQUILL IS BROKEN IN STORYBOOK </h4>`,
        demo: pushup 
      }
    ],
    open: true,
    setOpen: fn(),
  },
};
