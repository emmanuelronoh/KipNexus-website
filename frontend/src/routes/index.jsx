import {
  Box,
  Container,
  Grid,
  Pagination,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
  colors,
  createTheme,
  responsiveFontSizes,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useSpring, animated, useSprings } from '@react-spring/web';
import { useEffect, useState } from 'react';
import CourseCard from '../components/CourseCard';

import { getCourses } from '../courses';
import { useLoaderData, useSubmit, Form } from 'react-router-dom';
import CustomizedSnackbar from '../components/Snackbar';
import { useAtom } from 'jotai';
import { snackbarReducerAtom } from '../atoms/snackbarAtom';
import ScrollToHashElement from '../helper/scrollToHashElement';
import Results from '../components/Carousel';

// basis for this animation Mysterious Text
// https://codesandbox.io/p/sandbox/mysterious-text-animation-with-react-spring-vhj66
// By imhuyqn

const images = [
  '/images/firstBG.png',
  '/images/secondBG copy.png',
  '/images/thirdBG.png',
];
export async function loader({ request }) {
  const url = new URL(request.url);
  const page = url.searchParams.get('page');
  const courses = await getCourses(true, page || 1, 'A');
  return { courses };
}

const MysteriousText = ({ children, ...props }) => {
  const matches = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const animation = (i) =>
    useSpring({
      opacity: 1,
      from: { opacity: 0 },
      delay: 2 * (Math.random() * 650),
    });
  const startIndex = 60;
  const endIndex = 71;
  const theme = useTheme();

  return (
    <Typography
      variant={matches ? 'h3' : 'h4'}
      className='mysterious-text'
      {...props}
    >
      {children.split('').map((item, index) => (
        <animated.span
          key={index}
          style={{
            ...animation(index),
            fontFamily:
              index >= startIndex && index <= endIndex
                ? 'Passion One'
                : 'Archivo Black',
            fontSize:
              index >= startIndex && index <= endIndex ? '1.8em' : 'inherit',
            fontWeight:
              index >= startIndex && index <= endIndex ? 'bolder' : 'inherit',
            color:
              index >= startIndex && index <= endIndex
                ? theme.palette.primary.main
                : 'inherit',
            lineHeight:
              index >= startIndex && index <= endIndex ? '0.9em' : '1.3em',
          }}
        >
          {item}
        </animated.span>
      ))}
    </Typography>
  );
};

export function Index() {
  const [animationFinished, setAnimationFinished] = useState(false);
  const { courses } = useLoaderData();
  let theme = createTheme();
  theme = responsiveFontSizes(theme);
  const spring = useSpring({
    from: { x: -1000, y: -window.innerHeight * 0.35 },
    to: async (next, cancel) => {
      await next({ x: 0, y: -window.innerHeight * 0.35 });
      await next({});
    },
    onRest: () => setAnimationFinished(true),
  });
  const [springs, api] = useSprings(3, (index) => ({
    from: { x: index === 2 ? '-100%' : '100%' },
    to: { x: '0%' },
    delay: index * 200,
  }));
  const [snackbar] = useAtom(snackbarReducerAtom);
  const submit = useSubmit();
  let counter = 0;
  let count = courses.count;

  while (count > 0) {
    counter++;
    count -= 15;
  }
  /* if course count <= 15 then its 1
        if course count > 15 then its 2
        if course count <= 30 then its 3
        if course count > 30 then its 4
        so on
    /*/

  return (
    <>
      <CustomizedSnackbar />
      <Box sx={{ margin: 0, padding: 0, position: 'relative' }}>
        <Box display={'flex'}>
          {/* staggering effect */}
          {springs.map((props, index) => {
            let className = 'background-image';
            if (index === 0) className += ' first-image';
            else if (index === 1) className += ' second-image';
            else if (index === 2) className += ' third-image';
            return (
              <animated.img
                key={index}
                style={props}
                src={images[index]}
                className={className}
              />
            );
          })}
        </Box>

        <animated.div style={{ ...spring }}>
          <Container
            fixed={true}
            maxWidth={false}
            sx={{
              display: 'flex',
              padding: { xs: '4%', sm: '6%' },
              paddingLeft: { xs: '8%' },
              paddingRight: { xs: '8%' },
              width: { xs: '69%' },
            }}
            className='container-homepage'
          >
            <ThemeProvider theme={theme}>
              {animationFinished && (
                <MysteriousText>
                  Challenge Yourself, Unleash Your Potential: Start Your Free
                  Calisthenics Journey Today.
                </MysteriousText>
              )}
            </ThemeProvider>
          </Container>
        </animated.div>
        <Grid container>
          <Grid item>
            <div className='divider-1'></div>
          </Grid>
          <Grid item>
            <div className='divider-2'></div>
          </Grid>
          <Grid item>
            <div className='divider-3'></div>
          </Grid>
          <Grid item>
            <div className='divider-4'></div>
          </Grid>
        </Grid>
      </Box>

      <Container maxWidth='xl' component={'main'}>
        <ThemeProvider theme={theme}>
          <Box ml={4} mr={4}>
            <Grid container mb={2} mt={'10vh'}>
              <Grid item>
                <Typography
                  variant={'h2'}
                  fontFamily={'Play'}
                  fontWeight={'bolder'}
                  noWrap
                  gutterBottom
                >
                  Explore Courses
                </Typography>
              </Grid>
            </Grid>
            <ScrollToHashElement />
            <Grid
              id='courses'
              container
              rowSpacing={4}
              justifyContent={'flex-start'}
              columns={{ xs: 4, sm: 8, md: 12 }}
              columnSpacing={{ xs: 2, md: 3 }}
            >
              {/* Load lists of Courses that are approved only */}
              {courses.results?.map((course) => {
                return course.status === 'A' ? (
                  <Grid key={course.id} item xs={4} sm={4} md={4} lg={3}>
                    <CourseCard {...course} />
                  </Grid>
                ) : null;
              })}
            </Grid>
          </Box>
          <Form>
            <Box display={'flex'} justifyContent={'center'} mt={4}>
              <Pagination
                data-cy='index-pagination'
                color='primary'
                size='large'
                count={counter}
                onChange={(event, page) => {
                  submit(`page=${page}`);
                  const element = document.getElementById('courses');
                  window.scrollTo({
                    top: element.offsetTop,
                    behavior: 'smooth',
                  });
                }}
              />
            </Box>
          </Form>

          <Box component={'section'} m={4}>
            <Typography
              align='center'
              variant={'h2'}
              fontFamily={'Play'}
              fontWeight={'bolder'}
              noWrap
              gutterBottom
            >
              The Results
            </Typography>
            <Typography
              mb={2}
              variant='h6'
              fontSize={'smaller'}
              textAlign={'center'}
              align='center'
            >
              (satire for now)
            </Typography>
            <Results />
          </Box>
        </ThemeProvider>
      </Container>
    </>
  );
}
