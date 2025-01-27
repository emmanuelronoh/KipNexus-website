import { fn } from '@storybook/test';
import { YoutubeInput } from '../components/LectureReadMeTextFields';

const meta = {
  component: YoutubeInput,
  tags: ['autodocs'],
  args: {
    onChange: fn()
  }
};

export default meta;

/** This is being rendered in the accordion item's dialog. */
export const Default = {
  args: {
    actionData: {}, lecture: "https://youtube.com/someId", isError: false, itemId: 0
  }
};

/** When the Youtube value is invalid, this will turn red.*/
export const Error = {
  args: {
    actionData: { statusCode: 400, message: "{\"lecture\":[\"This field may not be blank.\"]}" },
    lecture: "intentionallywronglink.com", isError: true, itemId: 0
  }
}
