import { redirect } from 'react-router-dom';
import { deleteBlog } from '../courses';

export async function action({ params }) {
  await deleteBlog(params.blogId);
  return redirect('/blogs');
}
