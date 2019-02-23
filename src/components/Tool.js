import { Gpio } from 'onoff';

const Gpio = () => ({
  writeSync: (value) => {
    // console.log('writeSync: ', value)
  }
});

export default class Tool {
  constructor({ toolPin }) {
    this.tool = new Gpio(toolPin, 'out');
  }

  async enable(value) {
    if (value) this.tool.writeSync(1);
    if (!value) this.tool.writeSync(0);
  }
};
