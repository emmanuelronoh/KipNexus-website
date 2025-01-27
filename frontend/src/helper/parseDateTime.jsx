export default function parseCourseDateTime(course_updated) {
  // returns an array with a  more explicit last updated info i.e., last updated day and last updated hour
  const course_date = new Date(course_updated);
  const now = new Date();
  const course_day_updated = course_date.getDay();
  const course_hour_updated = course_date.getHours();
  const course_minute_updated = course_date.getMinutes();
  const last_updated_day = Math.abs(course_day_updated - now.getDay());
  const last_updated_hour = Math.abs(course_hour_updated - now.getHours());
  const last_updated_minute = Math.abs(
    course_minute_updated - now.getMinutes()
  );
  return [last_updated_day, last_updated_hour, last_updated_minute];
}

export function parseUserDateTime(date) {
  const date_joined = new Date(date);
  const date_joined_day = date_joined.getDay();
  const date_joined_month = date_joined.getMonth();
  const date_joined_year = date_joined.getFullYear();

  return [date_joined_day, date_joined_month, date_joined_year];
}

export function parseBlogDateTime(date) {
  const blog_date = new Date(date);
  const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'];
  const months = [
    'Jan',
    'Feb',
    'March',
    'April',
    'May',
    'June',
    'July',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec',
  ];
  const blog_day_name = days[blog_date.getDay()];
  const blog_month_name = months[blog_date.getMonth()];
  const blog_year = blog_date.getFullYear();
  const blog_day = blog_date.getDate();

  return [blog_day_name, blog_month_name, blog_day, blog_year];
}

export function parseCommentDate(date) {
  const comment_Date = new Date(date);
  const now = new Date();
  const comment_day_created = comment_Date.getDay();
  const comment_hour_created = comment_Date.getHours();
  const comment_minute_created = comment_Date.getMinutes();
  const last_created_day = Math.abs(comment_day_created - now.getDay());
  const last_created_hour = Math.abs(comment_hour_created - now.getHours());
  const last_created_minute = Math.abs(
    comment_minute_created - now.getMinutes()
  );

  return [last_created_day, last_created_hour, last_created_minute];
}
