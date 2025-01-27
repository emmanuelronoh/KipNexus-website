import { Box, Container, InputAdornment, TextField } from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import ReactQuill from 'react-quill';
import { modules } from '../helper/quillModule';
import { useRef } from 'react';

export function YoutubeInput({
  actionData,
  lecture,
  onChange,
  isError,
  itemId,
}) {
  return (
    <Box
      className='course-lecture-container'
      sx={{ width: '81%' }}
      component={'div'}
    >
      <TextField
        disabled={itemId === 1 || itemId === 2}
        error={isError}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <YouTubeIcon />
            </InputAdornment>
          ),
        }}
        fullWidth={true}
        id='lecture-url'
        label={
          isError && actionData?.message
            ? Object.entries(JSON.parse(actionData.message)).map(function ([
                key,
                value,
              ]) {
                if (key === 'lecture') {
                  return `${key}: ${value}`;
                } else {
                  return null;
                }
              })
            : 'e.g https://www.youtube.com/watch?v=SOMEID'
        }
        type='url'
        name='lecture'
        value={lecture}
        onChange={(e) => {
          onChange(e.target.value); // This is setLecture from the parent component, so  we are sending the values to our server.
        }}
      />
    </Box>
  );
}

export function DescriptionInput({
  actionData,
  description,
  onChange,
  isError,
  itemId,
}) {
  const labelRef = useRef(null);

  return (
    <Container className='ql-editor-container'>
      <fieldset className='quill-fieldset'>
        {isError &&
          actionData?.message &&
          (() => {
            try {
              const errors = JSON.parse(actionData.message);
              const errorMessage = errors.description
                ? `Description: ${errors.description}`
                : "Your Course's Overview*";

              labelRef.current.innerHTML = errorMessage;
              // labelRef.current.style.color = 'red';
            } catch (e) {
              console.error('Error parsing message:', e);
            }
          })()}
        <ReactQuill
          readOnly={itemId === 1 || itemId === 2}
          modules={modules}
          value={description}
          onChange={(value) => {
            onChange(value);
          }}
          className={isError ? 'ql-read-me ql-error' : 'ql-read-me'}
          style={{ border: isError ? '1px solid red' : '' }}
        />
        <label ref={labelRef} class='quill-label'>
          Your video description*
        </label>
      </fieldset>
    </Container>
  );
}
