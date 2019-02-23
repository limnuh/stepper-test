require('babel-register');
require('babel-polyfill');

// Import the rest of our application.
if (process.env.LED) return require('./src/led.js');
if (process.env.STEPPER) return require('./src/stepper.js');

const square = require('./src/square.js')
