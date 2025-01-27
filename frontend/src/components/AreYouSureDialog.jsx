import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Box, Fab, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { Form, useNavigation } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';
import { useAtom } from 'jotai';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

export default function AlertDialog({
  onClickApprove,
  onClickReject,
  onClickSubmit,
  onClickDelete,
  intent,
}) {
  const theme2 = useTheme();
  const isXsmallScreen = useMediaQuery(theme2.breakpoints.only('xs'));
  const [open, setOpen] = React.useState(false);
  const navigation = useNavigation();
  const isSmallScreen = useMediaQuery(theme2.breakpoints.down('sm'));

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      {intent === 'submitting course' && (
        <Button
          onClick={handleClickOpen}
          disabled={navigation.state === 'submitting'}
          sx={{ mt: 3 }}
          fullWidth={isXsmallScreen ? true : false}
          startIcon={<SendIcon />}
          variant='contained'
          color='primary'
        >
          Submit
        </Button>
      )}
      {intent === 'deleting course' && (
        <Button
          size='large'
          fullWidth={isSmallScreen}
          startIcon={<DeleteIcon />}
          sx={{ p: '1em', borderRadius: '0.9em', mb: 2 }}
          color='error'
          aria-label='delete'
          onClick={handleClickOpen}
        >
          Delete
        </Button>
      )}
      {intent === "change course's status" && (
        <Box display={'flex'} columnGap={2} mb={2}>
          <Button
            size='large'
            variant='outlined'
            fullWidth={isSmallScreen}
            startIcon={<ThumbDownIcon />}
            color='error'
            onClick={onClickReject}
          >
            Reject
          </Button>
          <Button
            size='large'
            variant='contained'
            fullWidth={isSmallScreen}
            startIcon={<ThumbUpIcon />}
            color='success'
            onClick={onClickApprove}
          >
            Approve
          </Button>
        </Box>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            {intent === 'submitting course'
              ? 'Are you sure you want to submit?'
              : 'Are you sure you want to delete the course?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            autoFocus
            onClick={() => {
              if (intent === 'submitting course') {
                onClickSubmit();
              } else {
                onClickDelete();
              }
            }}
          >
            {intent === 'submitting course' ? 'Submit' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
