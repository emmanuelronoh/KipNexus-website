import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Button } from '@mui/material';
import { Typography } from '@mui/material';
import { useAtom } from 'jotai';
import { isErrorAtom } from '../atoms/isErrorAtom';

export const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// for course
export default function InputFileUpload({
  name,
  text,
  onChange,
  workoutId,
  wrongFormId,
  correctFormId,
}) {
  const [, setIsError] = useAtom(isErrorAtom);
  return (
    <>
      <Button
        component='label'
        role={undefined}
        variant='outlined'
        tabIndex={-1}
        startIcon={<CloudUploadIcon />}
      >
        Upload {text}
        <VisuallyHiddenInput
          type='file'
          accept='image/*'
          onChange={(e) => {
            onChange(e, workoutId, wrongFormId, correctFormId);
            setIsError(false);
          }}
          name={name}
        />
      </Button>
    </>
  );
}
