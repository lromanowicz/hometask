# hometask


**Prerequisites**
1. Node.js installed

**Installation**
1. Run `npm install` in the root directory of this project

**Run Tests**

IMPORTANT: Before you run the tests, make sure to add your API token generated in the APP in the `cypress.config.js` file under `token` key.
Obviously I have removed mine from there for security reasons.

1. `npm test` will run all of the tests headlessly
2. `npm run cy:open` will open Cypress Test Runner where you can time-travel through the tests


**Notes**

I have picked Cypress because it's built on top of Mocha and Chai so there is no need for additional installations.
Also it has a very easy to use native support for network traffic (no additional packages needed again).

The tests are written just for iOS platform, but they are prepared to be easily extended for Android too.

