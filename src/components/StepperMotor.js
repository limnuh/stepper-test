// import { Gpio } from 'onoff';
const Gpio = () => ({
  writeSync: () => {}
});

export default class StepperMotor {
  constructor({ enPin, dirPin, stepPin, delay }) {
    this.enablePin = new Gpio(enPin, 'out');
    this.dirPin = new Gpio(dirPin, 'out');
    this.stepPin = new Gpio(stepPin, 'out');
    this.delay = delay || 5;
    this.steppLength = 2;
    this.position = 0;
  }

  enable(value) {
    if (value) this.enablePin.writeSync(0);
    if (!value) this.enablePin.writeSync(1);
  }

  async stepp(dir, stepps) {
    return new Promise((resolve) => setTimeout(resolve, 1000));
    // this.enable(true); //move upper
    // const direction = dir === 1;
    // this.dirPin.writeSync(direction);
    // for (let i = 0; i < stepps; i++) {
    //   this.stepPin.writeSync(1);
    //   await this.sleep(this.steppLength);
    //   this.stepPin.writeSync(0);
    //   await this.sleep(this.delay);
    // }
    // this.enable(false); //move upper
    // this.position += dir;
    // return;
  }

  sleep(timeout) {
    return new Promise((resolve) => setTimeout(resolve, timeout));
  }
};
