import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    experimentalStudio: true,
  },

  env: {
    REST_API_URL: "http://127.0.0.1:8000/",
    FRONTEND_API_URL: "http://localhost:5173/",
  },
});
