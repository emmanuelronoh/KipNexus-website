import {
  Box,
  Grid,
  InputAdornment,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
  responsiveFontSizes,
} from '@mui/material';
import getEmbedUrl from '../helper/getEmbedUrl';
import YouTubeIcon from '@mui/icons-material/YouTube';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';

export default function PreviewCourseTextField({
  isError,
  setIsError,
  courseContent,
  setCourseContent,
  actionData,
}) {
  let theme = createTheme();
  theme = responsiveFontSizes(theme);

  return (
    <>
      <Grid item alignSelf={'flex-start'}>
        <ThemeProvider theme={theme}>
          <Typography
            sx={{ textAlign: 'left' }}
            variant='h6'
            fontSize={'x-small'}
          >
            Preview this course
          </Typography>
          <Typography
            sx={{ display: 'block' }}
            variant='small'
            fontSize={'x-small'}
          >
            Put your youtube video link here
          </Typography>
        </ThemeProvider>
      </Grid>
      <Grid item container justifyContent={'center'} width='100%'>
        <Box
          className='course-lecture-container'
          sx={{ width: '100%' }}
          component={'div'}
        >
          {/* course preview textarea input */}
          <TextField
            value={courseContent.preview}
            onChange={(e) => {
              setIsError(false);
              setCourseContent({
                ...courseContent,
                preview: e.target.value,
              });
            }}
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
                    if (key === 'preview') {
                      return `${key}: ${value}`;
                    } else {
                      return null;
                    }
                  })
                : 'e.g https://www.youtube.com/watch?v=SOMEID'
            }
            type='url'
            name='preview'
            error={isError}
          />
        </Box>
        <Grid item xs>
          <Box mt={4} className='course-preview-container' component={'div'}>
            <Plyr
              source={{
                type: 'video',
                sources: [
                  {
                    src: getEmbedUrl(courseContent.preview) || '',
                    provider: 'youtube',
                  },
                ],
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
