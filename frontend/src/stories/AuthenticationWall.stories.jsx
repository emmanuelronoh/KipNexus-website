import { fn } from '@storybook/test';
import AuthenticationWall from '../components/AuthenticationWall';
import { reactRouterParameters } from 'storybook-addon-remix-react-router';

const meta = {
  component: AuthenticationWall,
  tags: ['autodocs'],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: '/course/123',
        loader: () => {
          const user = {

          };
          const course = {
            id: 41,
            average_rating: null,
            created_by_name: "test test",
            difficulty_display: "Beginner",
            enrollee_count: 0,
            title: "asdfasdfadsfadsfadsf",
            description: "adsfdasxzcvzxcvcxzv",
            thumbnail: null,
            difficulty: "BG",
            course_created: "2024-06-05",
            course_updated: "2024-06-05T09:16:25.589598Z",
            status: "A",
            price: "1.00",
            weeks: 3,
            is_draft: false,
            read: false,
            created_by: 3,
          };
          const courseContent = {};
          const accordion = [];
          const enrollees = [

          ];
          const comments = [];
          const progress = {};
          const userRating = {};
          return {
            user,
            course,
            courseContent,
            accordion,
            enrollees,
            comments,
            progress,
            userRating,
          };
        }
      }
    })
  }
};

export default meta;

/** This will be rendered in the course route, primary in the course content section, if the user is not authenticated */
export const Default = {
  args: {
    onClickSignUp: fn()
  }
};