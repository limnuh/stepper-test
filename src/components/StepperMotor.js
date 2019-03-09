import { Gpio } from 'onoff';

export default class StepperMotor {
  constructor({ enPin, dirPin, stepPin, delay, steppLength, name, resolution }) {
    this.enablePin = new Gpio(enPin, 'out');
    this.dirPin = new Gpio(dirPin, 'out');
    this.stepPin = new Gpio(stepPin, 'out');
    this.delay = delay || 5;
    this.steppLength = steppLength || 2;
    this.position = 0;
    this.name = name;
    this.resolution = resolution;
  }

  disable(value) {
    if (!value) this.enablePin.writeSync(0);
    if (value) this.enablePin.writeSync(1);
  }

  async stepp(dir) {
    const direction = (dir === 1 ? 1 : 0);
    this.dirPin.writeSync(direction);
    this.stepPin.writeSync(1);
    await this.sleep(this.steppLength);
    this.stepPin.writeSync(0);
    await this.sleep(this.delay);
    this.position += dir;
    return;
  }

  sleep(timeout) {
    return new Promise((resolve) => setTimeout(resolve, timeout));
  }
};
