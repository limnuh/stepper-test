import { Gpio } from 'onoff';

const enablePin = new Gpio(14, 'out');
const dirPin = new Gpio(15, 'out');
const stepPin = new Gpio(18, 'out');
const stepLength = 2;
const waitLength = 5;

let stepCount = 1000;
const sleep = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

const stepSome = async (dir, count, next) => {
  enablePin.writeSync(0);
  dirPin.writeSync(dir);
  for (let i = 0; i < count; i++) {
    //console.log(new Date, 'set dir pin + step pin', i, dir)
    stepPin.writeSync(1);
    await sleep(stepLength);
    stepPin.writeSync(0);
    await sleep(waitLength);
  }
  enablePin.writeSync(1);
}

stepSome(true, stepCount)
