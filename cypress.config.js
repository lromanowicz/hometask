const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'https://api.sensortower.com/v1'
  },
  env: {
    "token": "YOUR_API_TOKEN"
  }
});
