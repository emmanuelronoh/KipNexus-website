import { fn } from "@storybook/test";
import CourseTitleTextField from "../components/CourseTitleTextField";

const meta = {
  component: CourseTitleTextField,
  tags: ['autodocs']
};

export default meta;

/** This is being rendered in the create-course & edit-course route where you try to create a course entry.
 */
export const Default = {
  args: {
    isError: false,
    setIsError: fn(),
    course: {
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
    },
    setCourse: fn(),
    actionData: {
      message: {
        title: [
        ]
      },
    }
  },
};
/** This is being rendered in the create-course & edit-course route, where you try to create a course entry without filling out the text field. and clicking next stepper*/
export const Error = {
  args: {
    isError: true,
    course: {
      "id": 41,
      "average_rating": null,
      "created_by_name": "test test",
      "difficulty_display": "Beginner",
      "enrollee_count": 0,
      "title": "asdfasdfadsfadsfadsf",
      "description": "adsfdasxzcvzxcvcxzv",
      "thumbnail": null,
      "difficulty": "BG",
      "course_created": "2024-06-05",
      "course_updated": "2024-06-05T09:16:25.589598Z",
      "status": "A",
      "price": "1.00",
      "weeks": 3,
      "is_draft": false,
      "read": false,
      "created_by": 3
    },
    actionData: {statusCode: 400, message: "{\"title\":[\"This field may not be blank.\"]}"}  }
};
