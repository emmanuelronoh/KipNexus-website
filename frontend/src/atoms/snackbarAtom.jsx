import { atomWithReducer } from 'jotai/utils';

export const snackbarReducerAtom = atomWithReducer(
  {
    open: false,
    message: '',
  },
  snackBarReducer
);

function snackBarReducer(snackbar, action) {
  switch (action.type) {
    case 'submitted':
    case 'enrolled':
    case 'unenrolled':
    case 'deleted':
    case 'approved':
    case 'rejected':
      return {
        message: action.text,
        open: true,
      };
    case 'close':
      return {
        ...snackbar,
        open: false,
      };
    default:
      return snackbar;
  }
}
