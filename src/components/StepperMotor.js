// import { Gpio } from 'onoff';
const Gpio = () => ({
  writeSync: () => {}
});

export default class StepperMotor {
  constructor({ enPin, dirPin, stepPin, delay, steppLength, name }) {
    this.enablePin = new Gpio(enPin, 'out');
    this.dirPin = new Gpio(dirPin, 'out');
    this.stepPin = new Gpio(stepPin, 'out');
    this.delay = delay || 5;
    this.steppLength = steppLength || 2;
    this.position = 0;
    this.name = name;
  }

  enable(value) {
    if (value) this.enablePin.writeSync(0);
    if (!value) this.enablePin.writeSync(1);
  }

  async stepp(dir) {
    console.log(new Date(), {dir, name: this.name, pos: this.position});
    this.enable(true); //move upper
    const direction = dir === 1;
    this.dirPin.writeSync(direction);
    this.stepPin.writeSync(1);
    await this.sleep(this.steppLength);
    this.stepPin.writeSync(0);
    await this.sleep(this.delay);
    this.enable(false);
    this.position += dir;
    return;
  }

  sleep(timeout) {
    return new Promise((resolve) => setTimeout(resolve, timeout));
  }
};
