import React, { useState, useEffect } from 'react';

import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  MobileStepper,
  Slide,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/system';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { autoPlay } from 'react-swipeable-views-utils';
import SwipeableViews from 'react-swipeable-views';

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

export default function Results() {
  return <Carousel />;
}

function Carousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState('right');
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  let cardsPerPage;
  if (isSmallScreen) {
    cardsPerPage = 1;
  } else if (isMediumScreen) {
    cardsPerPage = 2;
  } else {
    cardsPerPage = 3;
  }

  const [hasPrev, setHasPrev] = useState(index > 0);
  const [hasNext, setHasNext] = useState(
    index < Math.ceil(data.length / cardsPerPage) - 1
  );

  useEffect(() => {
    setHasPrev(index > 0);
    setHasNext(index < Math.ceil(data.length / cardsPerPage) - 1);
  }, [index, cardsPerPage]);

  function handleNextPage() {
    setDirection('left');
    if (hasNext) {
      setIndex(index + 1);
    }
  }
  function handlePrevPage() {
    setDirection('right');
    if (hasPrev) {
      setIndex(index - 1);
    }
  }
  const handleIndexChange = (index) => {
    setIndex(index);
  };

  // let person = data[index];
  // const currentPageData = data.slice(index * cardsPerPage, (index + 1) * cardsPerPage);
  const groupedData = [];
  for (let i = 0; i < data.length; i += cardsPerPage) {
    groupedData.push(data.slice(i, i + cardsPerPage));
  }
  return (
    <Grid
      container
      columns={{ xs: 4, sm: 8, md: 12 }}
      justifyContent={'center'}
    >
      <AutoPlaySwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={index}
        onChangeIndex={handleIndexChange}
      >
        {groupedData.map((group, groupIndex) => (
          <Grid
            container
            item
            key={groupIndex}
            justifyContent={'center'}
            spacing={2}
            overflow={'hidden'}
          >
            {group.map((person) => (
              <Grid key={person.name} item xs={12} sm={6} md={3}>
                <Card variant='outlined' sx={{ height: '100%' }}>
                  <Box
                    display={'flex'}
                    alignItems={'center'}
                    justifyContent={'center'}
                  >
                    <CardMedia
                      component='img'
                      image={person.beforeImg}
                      alt='beforeImg'
                      width={150}
                      height={200}
                    />
                    <CardMedia
                      component='img'
                      image={person.afterImg}
                      alt='afterImg'
                      width={150}
                      height={200}
                    />
                  </Box>
                  <CardContent>
                    <Typography gutterBottom component={'blockquote'}>
                      <Typography component={'p'}>{person.quote}</Typography>
                    </Typography>
                    <Typography fontSize={'smaller'} fontWeight={'bold'}>
                      —{person.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ))}
      </AutoPlaySwipeableViews>
      <Grid item container justifyContent={'center'}>
        <MobileStepper
          steps={Math.ceil(data.length / cardsPerPage)}
          position='static'
          activeStep={index}
          nextButton={
            <Button size='small' onClick={handleNextPage} disabled={!hasNext}>
              {theme.direction === 'rtl' ? (
                <KeyboardArrowLeft />
              ) : (
                <KeyboardArrowRight />
              )}
            </Button>
          }
          backButton={
            <Button size='small' onClick={handlePrevPage} disabled={!hasPrev}>
              {theme.direction === 'rtl' ? (
                <KeyboardArrowRight />
              ) : (
                <KeyboardArrowLeft />
              )}
            </Button>
          }
        />
      </Grid>
    </Grid>
  );
}

const data = [
  {
    name: 'SpongeBob Squared',
    beforeImg:
      'https://assets.nick.com/uri/mgid:arc:imageassetref:shared.nick.us:a625d441-bbbf-42c8-9927-6a0157aac911?quality=0.7&gen=ntrn',
    afterImg:
      'https://static.wikia.nocookie.net/88d9491a-e2f6-49e8-b3d4-5c7627907a31/scale-to-width/370',
    quote: 'Thanks to this app i became ripped af',
  },
  {
    name: 'Tanjiro Kamado',
    beforeImg:
      'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/ea37168f-58bf-43ec-b98d-f15c62f681dd/dfchsps-d8bccfda-e6e9-4a7f-8485-097b4d1ba355.png/v1/fill/w_736,h_736,q_80,strp/shirtless_tanjiro_training_by_l_dawg211_dfchsps-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NzM2IiwicGF0aCI6IlwvZlwvZWEzNzE2OGYtNThiZi00M2VjLWI5OGQtZjE1YzYyZjY4MWRkXC9kZmNoc3BzLWQ4YmNjZmRhLWU2ZTktNGE3Zi04NDg1LTA5N2I0ZDFiYTM1NS5wbmciLCJ3aWR0aCI6Ijw9NzM2In1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.N0qTsS33UDX8MgrU2lTHm9EJ0C4lxzHLQfNpGPXgw54',
    afterImg:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDf3deHsDZGrBGrqyTcBwxx6deIM4Q1GzEMQ&s',
    quote:
      'Okay i was able to become stronger than before and defeat muzan thanks to this app',
  },
  {
    name: 'Saitama',
    beforeImg:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIDf9cwrz1x-OrfOAy77MUTtCWZhimxRAeZA&s',
    afterImg:
      'https://qph.cf2.quoracdn.net/main-qimg-c8010b4775bf02d599e659ae309f863e-pjlq',
    quote: 'I became a S class Hero thanks to the knowledge of calisthenics',
  },
  {
    name: 'Kenichi Shirahama',
    beforeImg: 'https://pbs.twimg.com/media/E1W13KnX0AEJeIb.jpg',
    afterImg:
      'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/12932351-e251-42ae-85e8-4c2633af08b4/d33fgxc-e4b6c6db-a6f7-4ac5-979a-37c1d0d9c64a.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzEyOTMyMzUxLWUyNTEtNDJhZS04NWU4LTRjMjYzM2FmMDhiNFwvZDMzZmd4Yy1lNGI2YzZkYi1hNmY3LTRhYzUtOTc5YS0zN2MxZDBkOWM2NGEucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.r3AzYP9ccAZitnDlutiB_hCjoKGB-QLSoLceqzwl3KI',
    quote: 'I became the mightest disciple',
  },
  {
    name: 'Izuku Midoriya',
    beforeImg:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRW_tACve_cswZD83AOOFPZPH_3RGwIax-MfA&s',
    afterImg:
      'https://i.pinimg.com/originals/9c/19/f7/9c19f7bbc0a84fccb2054f5c789e1554.jpg',
    quote: 'Calisthenics Changed my life!',
  },
  {
    name: 'Rudues Greyrat',
    beforeImg:
      'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/c5db6d8e-568b-4aa7-8d20-d8d3f7fcd3e6/dg4jmmo-fe1829ab-bd7c-43fe-8d76-eb153950eb8d.png/v1/fill/w_203,h_463,q_80,strp/rudeus_greyrat__25_by_selma11_dg4jmmo-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NDYzIiwicGF0aCI6IlwvZlwvYzVkYjZkOGUtNTY4Yi00YWE3LThkMjAtZDhkM2Y3ZmNkM2U2XC9kZzRqbW1vLWZlMTgyOWFiLWJkN2MtNDNmZS04ZDc2LWViMTUzOTUwZWI4ZC5wbmciLCJ3aWR0aCI6Ijw9MjAzIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.MP8RwRO8zHZIUXPTdVTAop5GNQq-5bDIwjlNVVct3c8',
    afterImg:
      'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/c5db6d8e-568b-4aa7-8d20-d8d3f7fcd3e6/dg4jm4x-1846923e-e911-45f0-abef-4938a90ae42c.png/v1/fill/w_313,h_398,q_80,strp/rudeus_greyrat__23_by_selma11_dg4jm4x-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9Mzk4IiwicGF0aCI6IlwvZlwvYzVkYjZkOGUtNTY4Yi00YWE3LThkMjAtZDhkM2Y3ZmNkM2U2XC9kZzRqbTR4LTE4NDY5MjNlLWU5MTEtNDVmMC1hYmVmLTQ5MzhhOTBhZTQyYy5wbmciLCJ3aWR0aCI6Ijw9MzEzIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.nAc-TLgz06N_X4o-O5mNZFN_Y3oiZaE8FssCn1B33Ko',
    quote:
      "I was depressed before I started doing any workouts and lost my confidence. Now I've become a better person thanks to this app.",
  },
];
