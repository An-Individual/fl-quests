# fl-quests
A browser extension that adds quest tracking information to the game Fallen London

In order to run the extension you'll nee dto do the following:

Install Node.js. This was built against version 24.13.1, but the latest version should be fine.

To install webpack by running run:

> npm install webpack webpack-cli --save-dev

Next run the following to package the extension code and compile the quests JSON.

> npm run build

To run the tests install Mocha and run:

> npm run test