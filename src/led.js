console.log(23434)

import { Gpio } from 'onoff';

const led = new Gpio(17, 'out');
const button = new Gpio(14, 'in', 'both'); 

console.log('run!!!!')
let nr = 0
button.watch((err, value) => {
    if (value) nr++;
    console.log({err, value, nr})
    led.writeSync(value);
});