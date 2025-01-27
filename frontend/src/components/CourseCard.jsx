import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import {
  Box,
  CardActionArea,
  Grid,
  Rating,
  ThemeProvider,
  createTheme,
  responsiveFontSizes,
  useMediaQuery,
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import defaultImage from '/images/noimg.png';
import { Link } from 'react-router-dom';
import { Parser } from 'html-to-react';
import truncateText from '../helper/truncateText';
let theme = createTheme();
theme = responsiveFontSizes(theme);

export default function CourseCard(props) {
  // const description = removeTags(props.description);
  const htmlToReactParser = new Parser();
  const rating = props.average_rating?.toFixed(2);
  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: { xs: 500, sm: 400 },
        maxHeight: 645,
        height: '100%',
      }}
      elevation={2}
    >
      <ThemeProvider theme={theme}>
        <CardActionArea
          disableRipple
          disableTouchRipple
          className='course-card'
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <Link to={`/course/${props.id}`} className='courses-link'>
            <CardMedia
              component='img'
              sx={{ aspectRatio: 16 / 9, objectFit: 'cover' }}
              src={props.thumbnail || defaultImage}
              alt='workout demo'
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultImage;
              }}
            />
            <CardContent>
              <Typography
                height={'4em'}
                gutterBottom
                fontFamily={'Play'}
                fontSize={'1.8em'}
                fontWeight={'bolder'}
                sx={{ wordBreak: 'break-word', lineHeight: '1.3em' }}
              >
                {truncateText(props.title, 60)}{' '}
                {/* Replace 2nd argument with the maximum number of words you want */}
              </Typography>
              {/* <Box maxHeight={'2em'} height={'100%'} maxWidth={250} sx={{ wordBreak: 'break-word' }} fontSize={'smaller'}>
                {htmlToReactParser.parse(truncateText(props.description, 80))}
              </Box> */}
            </CardContent>
            <Box sx={{ marginLeft: 2, marginRight: 2 }} component={'div'}>
              <Grid marginBottom={2} spacing={1} container>
                <Grid
                  item
                  container
                  alignItems={'flex-end'}
                  justifyContent={'space-between'}
                >
                  <Grid item>
                    <Typography
                      noWrap
                      fontSize='smaller'
                      fontWeight='bold'
                      variant='small'
                      color='text.secondary'
                    >
                      {props.created_by_name}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography noWrap variant='small' color='text.secondary'>
                      {props.difficulty_display}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item container justifyContent={'space-between'}>
                  <Grid item>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography fontSize={'small'} fontWeight={'bold'}>
                        {rating}
                      </Typography>
                      <Rating
                        name='half-rating-read'
                        size='small'
                        value={parseFloat(rating)}
                        precision={0.5}
                        readOnly
                      />
                    </Box>
                  </Grid>
                  <Grid item>
                    <Typography
                      noWrap
                      fontSize='x-small'
                      variant='small'
                      color='text.secondary'
                    >
                      Created: {props.course_created}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item container justifyContent={'space-between'}>
                  <Grid item>
                    <Box display={'flex'} alignItems={'center'}>
                      {props.price != 0.0 && (
                        <AttachMoneyIcon
                          sx={{ ml: props.price != 0.0 ? -1 : 0 }}
                        />
                      )}
                      <Typography
                        fontWeight='bolder'
                        fontSize='large'
                        variant='button'
                      >
                        {props.price == 0.0 ? 'Free' : props.price}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item>
                    <Typography
                      noWrap
                      fontSize='x-small'
                      variant='small'
                      color='text.secondary'
                    >
                      {props.enrollee_count === 0
                        ? 'No enrollees'
                        : `${props.enrollee_count} enrolled`}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </Link>
        </CardActionArea>
      </ThemeProvider>
    </Card>
  );
}
