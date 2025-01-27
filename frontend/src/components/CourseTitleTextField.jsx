import { TextField } from '@mui/material';

export default function CourseTitleTextField({
  isError,
  setIsError,
  course,
  setCourse,
  actionData,
}) {
  return (
    <TextField
      helperText=' '
      id='demo-helper-text-aligned-no-helper'
      label={
        isError && actionData?.message
          ? Object.entries(JSON.parse(actionData.message)).map(function ([
              key,
              value,
            ]) {
              if (key === 'title') {
                return `${key}: ${value}`;
              } else {
                return null;
              }
            })
          : "Your Course's Title"
      }
      fullWidth={true}
      minRows={5}
      maxRows={5}
      multiline
      required={true}
      inputProps={{ maxLength: 200 }}
      autoFocus
      name='title'
      value={course.title}
      onChange={(e) => {
        setCourse({
          ...course,
          title: e.target.value,
        });
        setIsError(false);
      }}
      error={isError}
    />
  );
}
