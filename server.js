// Transpile all code following this line with babel and use 'env' (aka ES6) preset.
require('babel-register')({
    presets: [ 'env' ]
})

// Import the rest of our application.
if (process.env.LED) return module.exports = require('./led.js');
module.exports = require('./stepper.js')