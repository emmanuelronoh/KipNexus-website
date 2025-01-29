import { useTheme } from '@emotion/react';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import { styled, alpha, duration } from '@mui/material/styles';
import { Link, useLoaderData, useLocation } from 'react-router-dom';
import { BorderColor } from '@mui/icons-material';
import { useEffect } from 'react';

export default function SearchBar({ isOpen, setIsOpen }) {
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return isSmallScreen ? (
    <>
      <Grid item xs={4} sm>
        <IconButton
          onClick={() => {
            setIsOpen(true);
          }}
          size='large'
          aria-label='search'
          color='inherit'
        >
          <SearchIcon />
        </IconButton>
      </Grid>
      <Dialog
        fullWidth={true}
        maxWidth='md'
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <DialogTitle>Search for Courses</DialogTitle>
        <DialogContent>
          <SearchInput isSmallScreen={isSmallScreen} />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  ) : (
    <Grid item>
      <SearchInput />
    </Grid>
  );
}

function SearchInput() {
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery((theme) => theme.breakpoints.up('md'));

  const { courses } = useLoaderData();

  // Ensure courses is an array before filtering
  const approvedCourses = Array.isArray(courses)
    ? courses.filter((course) => course.status === 'A')
    : [];

  return (
    <Search>
      <List sx={{ padding: 0 }}>
        <Autocomplete
          freeSolo
          disableClearable
          options={approvedCourses}
          getOptionLabel={(course) => course.title}
          renderInput={(params) => (
            <StyledTextField
              {...params}
              placeholder='Search…'
              inputProps={{
                ...params.inputProps,
                'aria-label': 'search',
                type: 'search',
              }}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon
                      sx={{ color: isSmallScreen ? 'initial' : 'white' }}
                    />
                  </InputAdornment>
                ),
              }}
            />
          )}
          renderOption={(props, option) => {
            const { key, ...otherProps } = props;

            return (
              <Link
                key={key}
                to={`/course/${option.id}`}
                className='courses-link'
              >
                <ListItem {...otherProps} sx={{ display: 'flex' }}>
                  <Box
                    maxWidth={isMediumScreen || isSmallScreen ? '85%' : '125px'}
                  >
                    <ListItemText className='text-overflow'>
                      {' '}
                      <Typography variant='small' sx={{ fontSize: '0.9em' }}>
                        {option.title}
                      </Typography>
                    </ListItemText>
                  </Box>
                  <Box marginLeft='auto' justifySelf={'flex-end'}>
                    <img
                      src={option.thumbnail}
                      style={{
                        width: '50px',
                        height: '40px',
                        objectFit: 'cover',
                        padding: 1,
                      }}
                    />
                  </Box>
                </ListItem>
              </Link>
            );
          }}
        />
      </List>
    </Search>
  );
}

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('Box')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledTextField = styled((props) => {
  const isMediumScreen = useMediaQuery((theme) => theme.breakpoints.up('md'));
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  return (
    <TextField
      {...props}
      sx={{
        '& .MuiInputBase-input': {
          color: isSmallScreen ? 'initial' : 'white',
          '&:focus': {
            width: isMediumScreen ? '30ch' : '20ch',
          },
        },
      }}
    />
  );
})(({ theme }) => ({
  minWidth: 150,
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
    },
  },
}));