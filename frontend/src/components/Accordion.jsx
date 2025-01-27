import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Popover,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
// import { ResponsiveDialog as AccordionItemDialogCreate } from "../routes/create";

import { useEffect, useRef, useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import AddAccordionItem from './AddAccordionItem';
import { useImmerAtom } from 'jotai-immer';
import { accordionsAtom } from '../atoms/accordionsAtom';
import { ResponsiveDialog as AccordionItemDialog } from '../routes/course';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ResponsiveDialog as AccordionItemDialogCreate } from './AccordionItem';
import { useFetcher, useLoaderData } from 'react-router-dom';

export function AccordionSectionCreate({
  actionData,
  eventHandlers,
  onClickDelete,
  onChange,
  handleChange,
  expanded,
  accordion,
}) {
  const {
    handleDeleteAccordionItem: onClickDeleteItem,
    handleEditAccordionItem: onChangeItem,
    handleAddAccordionItem: onClickAddItem,
  } = eventHandlers;

  const [isEditing, setIsEditing] = useState(false);
  const [parent, enableAnimations] = useAutoAnimate();
  const [heading, setHeading] = useState(accordion.heading);
  const [isError, setIsError] = useState(false);
  const [accordions, updateAccordions] = useImmerAtom(accordionsAtom);

  useEffect(() => {
    if (isEditing) {
      // debounce event handler
      const handler = setTimeout(() => {
        onChange({
          ...accordion,
          heading: heading,
        });
      }, 300);
      return () => {
        clearTimeout(handler);
      };
    }
  }, [heading]);
  let accordionHeadingContent;

  if (isEditing) {
    accordionHeadingContent = (
      <>
        {/* Accordtion heading edit, Textarea input form */}
        <TextField
          error={isError}
          data-cy={`Accordion edit-${accordion.id}`}
          id='standard-multiline-flexible'
          label={'Accordion Heading'}
          multiline
          maxRows={4}
          variant='standard'
          value={heading}
          fullWidth
          onChange={(e) => {
            setHeading(e.target.value);
            if (!e.target.value) {
              setIsError(true);
            } else {
              setIsError(false);
            }
          }}
        />
        <Button
          data-cy='Accordion save-btn'
          onClick={() => setIsEditing(false)}
          disabled={isError}
        >
          Save
        </Button>
      </>
    );
  } else {
    accordionHeadingContent = (
      <Typography
        fontWeight='bold'
        align='justify'
        sx={{ width: '100%', flexShrink: 0 }}
      >
        {accordion.heading}
      </Typography>
    );
  }

  return (
    <Accordion
      expanded={isEditing ? false : expanded === accordion.id}
      onChange={handleChange(accordion.id)}
    >
      <AccordionSummary
        expandIcon={
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {accordion.id !== 0 && (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  sx={{ paddingLeft: 2, display: isEditing ? 'none' : 'flex' }}
                  startIcon={<EditIcon />}
                  size='small'
                />
                <Button
                  onClick={() => onClickDelete(accordion.id)}
                  sx={{ paddingLeft: 2, display: isEditing ? 'none' : 'flex' }}
                  startIcon={<DeleteIcon />}
                  size='small'
                />
              </>
            )}
          </Box>
        }
        aria-controls='panel1bh-content'
        id='panel1bh-header'
        sx={{ padding: '3%' }}
      >
        {accordionHeadingContent}
      </AccordionSummary>
      {
        /* don't render the first accordion item's buttons (they are just examples) */
        accordion.id !== 0 && (
          <>
            <AccordionDetails>
              <AddAccordionItem
                actionData={actionData}
                onClick={onClickAddItem}
                accordionId={accordion.id}
              />
            </AccordionDetails>
          </>
        )
      }

      <ul ref={parent}>
        {accordion.items
          ? accordion.items.map((item) => (
              /* don't render the first accordion (they are just examples) */

              <AccordionDetails sx={{ paddingLeft: '2%' }} key={item.id}>
                <AccordionItemDialogCreate
                  actionData={actionData}
                  immerAtom={[accordions, updateAccordions]}
                  itemId={item.id}
                  onClick={onClickDeleteItem}
                  onChange={onChangeItem}
                  accordionId={accordion.id}
                  accordionItem={item}
                >
                  {item.heading}
                </AccordionItemDialogCreate>
              </AccordionDetails>
            ))
          : null}
      </ul>
    </Accordion>
  );
}

export function AccordionSection({ handleChange, expanded, accordion }) {
  const { user, course, enrollees } = useLoaderData();
  const enrollment = enrollees.find(
    (enrollee) =>
      enrollee.user === user.user_id && enrollee.course.id === course.id
  );
  const isInstructor = user.user_id === course.created_by;
  const label = { inputProps: { 'aria-label': 'Checkbox' } };
  const [anchorEl, setAnchorEl] = useState(null);
  const fetcher = useFetcher();

  const checked = fetcher.formData
    ? fetcher.formData.get('is_clicked') === true
    : accordion.is_clicked;

  const accordionHeadingContent = (
    <Typography
      fontWeight='bold'
      align='justify'
      sx={{ width: '100%', flexShrink: 0 }}
    >
      {accordion.heading}
    </Typography>
  );

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  function handleClickCheckbox(event, accordion) {
    fetcher.submit(
      {
        intent: 'updateUserSection',
        sectionId: accordion.id,
        is_clicked: event.target.checked,
      },
      { method: 'PATCH' }
    );
    event.stopPropagation();
  }

  const open = Boolean(anchorEl);
  return (
    <Accordion
      expanded={expanded === accordion.id}
      onChange={handleChange(accordion.id)}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls='panel1bh-content'
        id='panel1bh-header'
        sx={{ padding: '3%' }}
      >
        <Box display='flex' alignItems='center'>
          <Checkbox
            {...label}
            checked={checked ? true : false}
            onClick={(e) => handleClickCheckbox(e, accordion)}
            sx={{
              display: isInstructor || !enrollment ? 'none' : 'inline-block',
            }}
            onMouseOver={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
          />
          {accordionHeadingContent}
        </Box>
        <Popover
          id='mouse-over-popover'
          sx={{
            pointerEvents: 'none',
          }}
          open={open}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          onClose={handlePopoverClose}
          disableRestoreFocus
        >
          <Typography sx={{ p: 1 }}>Completed</Typography>
        </Popover>
      </AccordionSummary>

      {accordion.items
        ? accordion.items?.map((item) => (
            <AccordionDetails sx={{ paddingLeft: '2%' }} key={item.id}>
              <AccordionItemDialog accordionItem={item}>
                {item.heading}
              </AccordionItemDialog>
            </AccordionDetails>
          ))
        : null}
    </Accordion>
  );
}
