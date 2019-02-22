// Transpile all code following this line with babel and use 'env' (aka ES6) preset.
require("babel-core/register");
require("babel-polyfill");
require('babel-register')({
    presets: [ 'env', "es2015", "stage-0" ]
})

// Import the rest of our application.
if (process.env.LED) return module.exports = require('./src/led.js');
if (process.env.STEPPER) return module.exports = require('./src/stepper.js');

module.exports = require('./src/square.js')
