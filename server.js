require('babel-register');
require('babel-polyfill');

// Import the rest of our application.
if (process.env.LED) return require('./src/testLed.js');
if (process.env.STEPPER) return require('./src/testStepper.js');
if (process.env.CNC) return require('./src/testCnc.js');
if (process.env.SERVO) return require('./src/testServo.js');

const cnc = require('./src/server.js')
