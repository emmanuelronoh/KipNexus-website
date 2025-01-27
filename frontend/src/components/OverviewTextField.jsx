import {
  Container,
  Grid,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
  responsiveFontSizes,
} from '@mui/material';
import ReactQuill from 'react-quill';
import { modules, modulesCard } from '../helper/quillModule';
import { useRef } from 'react';

export default function OverviewTextField({
  isError,
  setIsError,
  courseContent,
  setCourseContent,
  actionData,
}) {
  let theme = createTheme();
  theme = responsiveFontSizes(theme);

  const labelRef = useRef(null);
  return (
    <>
      <Grid item alignSelf='flex-start'>
        <ThemeProvider theme={theme}>
          <Typography variant='h4' fontWeight={'bold'}>
            Overview
          </Typography>
        </ThemeProvider>
      </Grid>
      <Grid item width={'100%'} pt='0 !important'>
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
              onChange={(value) => {
                setCourseContent({
                  ...courseContent,
                  overview: value,
                });
                setIsError(false);
              }}
              data-cy='Course Overview'
              value={courseContent.overview}
              modules={modules}
              className={`ql-overview ${isError ? 'ql-error' : ''} ${courseContent.overview ? 'has-content' : ''}`}
              style={{ border: isError ? '1px solid red' : '' }}
            />
            <label ref={labelRef} className='quill-label'>
              Your Course's Overview*
            </label>
          </fieldset>
          <TextField
            type='hidden'
            value={courseContent.overview}
            name='overview'
          />{' '}
          {/* we need the name attribute when sending this data to server, hence the hidden */}
        </Container>
      </Grid>
    </>
  );
}
