require('babel-register');
require('babel-polyfill');

// Import the rest of our application.
if (process.env.LED) return require('./src/led.js');
if (process.env.STEPPER) return require('./src/stepper.js');
if (process.env.CNC) return require('./src/cnc.js');
if (process.env.SERVO) return require('./src/servo.js');

const cnc = require('./src/server.js')
