import { Gpio } from 'onoff';

const enablePin = new Gpio(16, 'out');
const dirPin = new Gpio(20, 'out');
const stepPin = new Gpio(21, 'out');
const stepLength = 0;
const waitLength = 0;

let stepCount = 1000;
const sleep = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

const stepSome = async (dir, count, next) => {
  enablePin.writeSync(0);
  dirPin.writeSync(dir);
  for (let i = 0; i < count; i++) {
    stepPin.writeSync(1);
    await sleep(stepLength);
    stepPin.writeSync(0);
    await sleep(waitLength);
  }
  enablePin.writeSync(1);
  return;
}

(async () => {
  console.log('start')
  await stepSome(1, stepCount);
  console.log('elso kesz')
  await stepSome(0, stepCount);
  console.log('masodik kesz')
})()
