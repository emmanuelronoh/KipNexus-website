import { Box, Grid, IconButton, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { useAtom } from 'jotai';
import { isErrorAtom } from '../atoms/isErrorAtom';

const headingDefault = 'Add an accordion, e.g., Phase 1';
export default function AddAccordion({ actionData, onClick }) {
  // This component represents the input field for adding a section / accordion
  const [isError, setIsError] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [heading, setHeading] = useState(headingDefault);

  useEffect(() => {
    // means there is an error message from action server
    if (actionData?.accordion) {
      setIsError(true);
    }
  }, [actionData]);

  return (
    <Box component='div' mb={4}>
      <Grid container alignItems={'center'} spacing={3}>
        <Grid item xs={10} sm={11}>
          <TextField
            data-cy='Add Accordion Input'
            id='outlined-textarea'
            label={
              isError && actionData?.message
                ? Object.entries(JSON.parse(actionData.message)).map(function ([
                    key,
                    value,
                  ]) {
                    if (key === 'heading') {
                      return `${key}: ${value}`;
                    } else {
                      return null;
                    }
                  })
                : 'Add Accordion / Section'
            }
            value={heading}
            placeholder="Summary or Section's Heading"
            multiline
            fullWidth
            onChange={(e) => {
              setIsError(false);
              setHeading(e.target.value);
            }}
            error={isError}
            name='heading'
          />
        </Grid>
        <Grid item xs={2} sm={1}>
          <IconButton
            data-cy='Add Accordion Button'
            sx={{ border: '1px solid #1976D2' }}
            onClick={() => {
              setHeading('');
              onClick(heading);
            }}
            color='primary'
            aria-label='add'
          >
            <AddIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
}
