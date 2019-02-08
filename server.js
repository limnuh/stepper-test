const Gpio = require('onoff').Gpio;
const led = new Gpio(17, 'out');
const button = new Gpio(14, 'in', 'both');
 

console.log('run!!!!')
//led.writeSync(1);
button.watch((err, value) => {
    console.log({err, value})
    led.writeSync(value);
});