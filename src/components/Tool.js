import piblaster from '../../pi-blaster.js';

export default class Tool {
  constructor({ toolPin, waitingTime }) {
    this.max = 25;
    this.min = 10;
    this.waitingTime = waitingTime || 200;
    this.toolPin = toolPin || 10;
    this.drawState = false;
  }

  sleep(timeout) {
    return new Promise((resolve) => setTimeout(resolve, timeout));
  }

  range(percent){
    if(typeof percent === 'boolean' && !percent){
      return 0;
    }
    return 0.002 * percent + 0.05;
  }

  async draw(value) {
    if (value){
      piblaster.setPwm(this.toolPin, this.range(this.max));
      this.drawState = true;
      await this.sleep(this.waitingTime)
    }
    if (!value){
      piblaster.setPwm(this.toolPin, this.range(this.min));
      this.drawState = false;
      await this.sleep(this.waitingTime)
    }
  }

  async disable() {
    piblaster.setPwm(this.toolPin, 0);
  }
};
