import { redirect } from 'react-router-dom';
import { updateCourse } from '../courses';

export async function action({ request, params }) {
  const formData = await request.formData();
  await updateCourse(params.courseId, formData);
  return redirect('/pending');
}
