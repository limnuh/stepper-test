import { Gpio } from 'onoff';

export default class StepperMotor {
  constructor({ enPin, dirPin, stepPin, steppLength }) {
    this.enablePin = new Gpio(enPin, 'out');
    this.dirPin = new Gpio(dirPin, 'out');
    this.stepPin = new Gpio(stepPin, 'out');
    this.steppLength = steppLength || 0.01;
    this.position = 0;
  }

  enable(value) {
    if (value) this.enablePin.writeSync(0);
    if (!value) this.enablePin.writeSync(1);
  }

  async stepp(dir, stepps, delayBetweenStepps = .2) {
    this.enable(true) //move upper
    const direction = dir === 1;
    this.dirPin.writeSync(direction);
    for (let i = 0; i < stepps; i++) {
      this.stepPin.writeSync(1);
      await this.sleep(this.steppLength);
      this.stepPin.writeSync(0);
      await this.sleep(0.01);
    }
    this.enable(false) //move upper
    this.position += dir;
    return;
  }

  sleep(timeout) {
    return new Promise((resolve) => setTimeout(resolve, timeout*1000))
  }
};
