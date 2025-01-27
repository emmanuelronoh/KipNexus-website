import { reactRouterParameters } from 'storybook-addon-remix-react-router';
import CourseCard from '../components/CourseCard';
import thumbnail from '/images/what.jpg'
const meta = {
  component: CourseCard,
  tags: ['autodocs'],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { courseId: '123' },
      },
      routing: { path: '/course/:courseId' },
    }),
  },
};

export default meta;



/**  This is being rendered in the index route, in which you'll see multiple of these cards.*/
export const Default = {
  args:
   {
      id: 41,
      average_rating: null,
      created_by_name: "test test",
      difficulty_display: "Beginner",
      enrollee_count: 0,
      title: "I am just a card here",
      description: "adsfdasxzcvzxcvcxzv",
      thumbnail: thumbnail,
      difficulty: "BG",
      course_created: "2024-06-05",
      course_updated: "2024-06-05T09:16:25.589598Z",
      status: "A",
      price: "1.00",
      weeks: 3,
      is_draft: false,
      read: false,
      created_by: 3,
    }

};