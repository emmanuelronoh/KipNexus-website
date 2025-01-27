import { Container, TextField } from '@mui/material';
import ReactQuill from 'react-quill';
import { modules, modulesCard } from '../helper/quillModule';
import { useEffect, useRef, useState } from 'react';

export default function DescriptionTextField({
  isError,
  setIsError,
  course,
  setCourse,
  actionData,
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
                : "Your Course's Description*";

              labelRef.current.innerHTML = errorMessage;
              // labelRef.current.style.color = 'red';
            } catch (e) {
              console.error('Error parsing message:', e);
            }
          })()}
        <ReactQuill
          onChange={(value) => {
            setCourse({
              ...course,
              description: value,
            });
            setIsError(false);
            labelRef.current.innerHTML = "Your Course's Description*";
          }}
          value={course.description}
          modules={modules}
          className={`ql-description ${isError ? 'ql-error' : ''} ${course.description ? 'has-content' : ''}`}
          // style={{ border: isError ? '1px solid red' : '' }}
        />
        <label ref={labelRef} className='quill-label'>
          Your Course's Description*
        </label>
      </fieldset>
      <TextField type='hidden' value={course.description} name='description' />{' '}
      {/* we need the name attribute when sending this data to server, hence the hidden */}
      <TextField type='hidden' name='is_draft' />
    </Container>
  );
}
