import { redirect } from 'react-router-dom';
import { deleteCourse } from '../courses';

export async function action({ params }) {
  await deleteCourse(params.courseId);
  return redirect('/');
}
