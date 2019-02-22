import { Gpio } from 'onoff';

const enablePin = new Gpio(14, 'out');
const dirPin = new Gpio(15, 'out');
const stepPin = new Gpio(18, 'out');
const stepLength = 2;
const waitLength = 5;

let stepCount = 2560;
const sleep = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

const stepSome = async (dir, count, next) => {
  enablePin.writeSync(0);
  dirPin.writeSync(dir);
  for (let i = 0; i < count; i++) {
    stepPin.writeSync(1);
    console.log(i)
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