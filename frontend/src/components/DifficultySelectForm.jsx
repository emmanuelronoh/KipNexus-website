import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

export default function DifficultySelectForm({
  isError,
  setIsError,
  course,
  setCourse,
}) {
  return (
    <FormControl required={true} sx={{ width: 150 }} error={isError}>
      <InputLabel id='demo-simple-select-label'>Difficulty</InputLabel>
      <Select
        data-cy='Select Difficulty'
        labelId='demo-simple-select-label'
        id='demo-simple-select'
        value={course.difficulty}
        label='Difficulty'
        onChange={(e) => {
          setCourse({
            ...course,
            difficulty: e.target.value,
          });
          setIsError(false);
        }}
        inputProps={{ name: 'difficulty' }}
        autoWidth
      >
        <MenuItem value={'BG'}>Beginner</MenuItem>
        <MenuItem value={'IN'}>Intermediate</MenuItem>
        <MenuItem value={'AD'}>Advanced</MenuItem>
      </Select>
    </FormControl>
  );
}
