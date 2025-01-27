import React, { useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import AutoImage from '@ckeditor/ckeditor5-image/src/autoimage';
import AutoLink from '@ckeditor/ckeditor5-link/src/autolink';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Base64UploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/base64uploadadapter';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableColumnResize from '@ckeditor/ckeditor5-table/src/tablecolumnresize';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import { Box, Button, Container, TextField, Typography } from '@mui/material';
import { Form, redirect, useActionData, useNavigation } from 'react-router-dom';
import { createBlog } from '../courses';

export async function action({ request }) {
  const formData = await request.formData();
  const blog = await createBlog(formData);
  const errors = {};
  if (blog.statusCode >= 400) {
    if (
      typeof blog.message === 'string' &&
      (blog.message.startsWith('{') || blog.message.startsWith('['))
    ) {
      try {
        const errorMessage = JSON.parse(blog.message);
        errors.message = errorMessage;
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    } else {
      errors.message = blog.message;
    }
    errors.statusCode = blog.statusCode;
    return errors;
  }
  return redirect('/blogs');
}
// Yeah, I know the dependency for this Krazy, but because the Vite integration for CkEditor5 doesn't seem to work, I've already wasted more than 5 hours trying to get it to work!
export default function CreateBlog() {
  const [blogContent, setBlogContent] = useState(
    'Hi there, start writing your own blog now'
  );
  const navigation = useNavigation();
  const errors = useActionData();

  return (
    <Container maxWidth='md'>
      <Form method='post'>
        <Box className='editor'>
          <TextField
            error={Boolean(errors?.message?.title)}
            required
            multiline
            fullWidth
            id='outlined-basic'
            name='title'
            label={
              errors?.message
                ? Object.entries(errors?.message).map(
                    ([key, value]) =>
                      key === 'title' && (
                        <Typography key={key}>{`${key}: ${value}`}</Typography>
                      )
                  )
                : 'Title'
            }
            variant='outlined'
            sx={{ mb: 2 }}
          />
          <TextField
            error={Boolean(errors?.message?.summary)}
            required
            multiline
            fullWidth
            id='outlined-basic'
            name='summary'
            label={
              errors?.message
                ? Object.entries(errors?.message).map(
                    ([key, value]) =>
                      key === 'summary' && (
                        <Typography key={key}>{`${key}: ${value}`}</Typography>
                      )
                  )
                : 'Summary'
            }
            variant='outlined'
            sx={{ mb: 2 }}
          />
          <TextField type='hidden' name='content' value={blogContent} />
          <CKEditor
            editor={ClassicEditor}
            config={{
              plugins: [
                Alignment,
                AutoImage,
                AutoLink,
                Autoformat,
                Base64UploadAdapter,
                BlockQuote,
                Bold,
                CloudServices,
                Essentials,
                FontFamily,
                FontSize,
                Heading,
                Highlight,
                Image,
                ImageCaption,
                ImageInsert,
                ImageResize,
                ImageStyle,
                ImageToolbar,
                ImageUpload,
                Indent,
                Italic,
                Link,
                List,
                MediaEmbed,
                Paragraph,
                PasteFromOffice,
                Table,
                TableColumnResize,
                TableToolbar,
                TextTransformation,
                Underline,
                Undo,
              ],
              toolbar: [
                'undo',
                'redo',
                '|',
                'heading',
                'fontFamily',
                'fontSize',
                '|',
                'bold',
                'italic',
                'highlight',
                'link',
                'bulletedList',
                'numberedList',
                'underline',
                '|',
                'outdent',
                'indent',
                'alignment',
                '|',
                'imageInsert',
                'blockQuote',
                'insertTable',
                'mediaEmbed',
              ],
              language: 'en',
              image: {
                toolbar: [
                  'imageTextAlternative',
                  'toggleImageCaption',
                  'imageStyle:inline',
                  'imageStyle:block',
                  'imageStyle:side',
                ],
              },
              table: {
                contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
              },
            }}
            onReady={(editor) => {
              console.log('Editor is ready to use!', editor);
            }}
            data={blogContent}
            onChange={(event, editor) => {
              const data = editor.getData();
              setBlogContent(data);
            }}
            // onBlur={(event, editor) => {
            //     console.log('Blur.', editor);
            // }}
            // onFocus={(event, editor) => {
            //     console.log('Focus.', editor);
            // }}
          />
        </Box>
        {errors?.message &&
          Object.entries(errors?.message).map(
            ([key, value]) =>
              key === 'content' && (
                <Typography p={'1em 1.5em'} color={'red'} key={key}>
                  {`${key}: ${value}`}
                </Typography>
              )
          )}
        <Box pl={'1.5em'}>
          <Button
            disabled={navigation.state === 'submitting'}
            type='submit'
            variant='contained'
            sx={{ padding: '0.6em 1.8em', fontWeight: 'bolder' }}
          >
            Post
          </Button>
        </Box>
      </Form>
    </Container>
  );
}
