import { TextField } from '@mui/material';

export default function WeeksTextField({
  isError,
  setIsError,
  course,
  setCourse,
}) {
  return (
    <TextField
      name='weeks'
      id='outlined-number'
      label='Weeks'
      type='number'
      InputLabelProps={{
        shrink: true,
      }}
      sx={{ width: 100 }}
      inputProps={{
        min: '0',
      }}
      value={course.weeks}
      onChange={(e) => {
        setCourse({
          ...course,
          weeks: e.target.value,
        });
        setIsError(false);
      }}
      error={isError}
    />
  );
}
