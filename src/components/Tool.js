import { Gpio } from 'onoff';

export default class Tool {
  constructor({ toolPin }) {
    this.tool = new Gpio(toolPin, 'out');
  }

  async enable(value) {
    if (value) this.tool.writeSync(1);
    if (!value) this.tool.writeSync(0);
  }
};
