import { fn } from '@storybook/test';
import AreYouSureDialog from '../components/AreYouSureDialog';

const meta = {
  component: AreYouSureDialog,
  tags: ['autodocs'],
  args: {
    onClickApprove: fn(), onClickReject: fn(), onClickSubmit: fn(), onClickDelete: fn(),
  }
};

export default meta;

/** A pop-up dialog when submitting a course creation entry */
export const Submit = {
  args: {
    intent: 'submitting course'
  }
};

/** A pop-up dialog when deleting a course instance */
export const Delete = {
  args: {
    intent: "deleting course"
  }
};

/** Do note that there's no pop-up when each one of these is clicked. I'm just rendering this in AreYouSureDialog for the sake of my sanity.*/
export const RejectAndApprove = {
  args: {
    intent: "change course's status"
  }
};

