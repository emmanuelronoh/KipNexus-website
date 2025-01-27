import { withRouter } from 'storybook-addon-remix-react-router';
import '../src/index.css';
/** @type { import('@storybook/react').Preview } */
const preview = { 
  decorators: [withRouter],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
