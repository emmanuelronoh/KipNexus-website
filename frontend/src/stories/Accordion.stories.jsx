import { fn } from "@storybook/test";
import { AccordionSection } from "../components/Accordion";
import { reactRouterParameters } from "storybook-addon-remix-react-router";

const meta = {
  component: AccordionSection,
  tags: ['autodocs'],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/course/123",
        loader: () => {
          const user = {
            user_id: 123,
            username: "test123",
            first_name: "testuser",
            last_name: "testuser",
            profile_pic:
              "/images/profile_pictures/447805331_846888980800214_7874484468425502854_n.jpg",
            is_staff: false,
            is_superuser: false,
            date_joined: "2024-06-02T16:43:38Z",
          };
          const enrollees = [
            {
              id: 123,
              course: {
                id: 321,
                average_rating: null,
                created_by_name: "123 123",
                difficulty_display: "Intermediate",
                enrollee_count: 1,
                title: "test pagination",
                description: "<p>12312e3123</p>",
                thumbnail:
                  "http://127.0.0.1:8000/images/images/1Ibnwjo9LtUFxRY1MZgOcvg.png",
                difficulty: "IN",
                course_created: "2024-06-05",
                course_updated: "2024-06-06T17:15:25.075716Z",
                status: "A",
                price: "123.00",
                weeks: 4,
                is_draft: false,
                read: true,
                created_by: 2,
              },
              total_sections: 3,
              date_enrolled: "2024-06-07T02:06:54.495356Z",
              user: 15,
            },
          ];
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

          return { user, course, enrollees };
        },
      },
    }),
  },
};

export default meta;

/** Accordion component in the course route, course content section */
export const Default = {
  args: {
    handleChange: fn(),
    expanded: false,
    accordion: { heading: "Example heading" },
  },
};
