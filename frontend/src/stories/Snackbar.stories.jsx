import { Alert, Snackbar } from '@mui/material';
import CustomizedSnackbar from '../components/Snackbar';
import { action } from "@storybook/addon-actions";

const meta = {
  component: CustomizedSnackbar,
  tags: ['autodocs'],

};

export default meta;




/** This is being mounted when the CTA button is triggered, such as when enrolling in a course, deleting a course, etc. */

export const Default = {
  render: () => (
    <Snackbar open={true}>
      <Alert
        onClose={action('handleClose')}
        severity="success"
        variant="filled"
        sx={{ width: '100%' }}
      >
        This is my Snackbar
      </Alert>
    </Snackbar>
  )
};