import StepperMotor from './StepperMotor';
import Tool from './Tool';

export default class MotorControl{
  constructor(xSettings, ySettings, toolSeetings){
    this.MX = new StepperMotor(xSettings);
    this.MY = new StepperMotor(ySettings);
    this.laser = new Tool(toolSeetings);
  }

  gcd(a, b){
    if (!b) return a;
    return this.gcd(b, a % b);
  }

  lcm(a, b){
    return a * b / this.gcd(a, b);
  }

  sign(a){
    if (a > 0) return 1;
    if (a < 0) return -1;
    return 0;
  }

  async stepp({motor, dir}){
    if (motor === 1) await this.MX.stepp(dir);
    if (motor === 2) await this.MY.stepp(dir);
    return;
  }

  setResolution(resolution) {
    this.MX.resolution = resolution;
    this.MY.resolution = resolution;
  }

  createMotorStepps({xPos, yPos, prevXPos, prevYPos}){
    const step1 = parseInt(Math.round( ( xPos - prevXPos ) / this.MX.resolution ));
    const step2 = parseInt(Math.round( ( yPos - prevYPos ) / this.MY.resolution ));
    const Total_step = Math.sqrt((step1 * step1 + step2 * step2));

    if (Total_step <= 0) return [];

    const dir1 = this.sign(step1); 
    const dir2 = this.sign(step2);

    const absStep1 = Math.abs(step1);
    const absStep2 = Math.abs(step2);
    const stepps = [];

    let total_micro_step = this.lcm(absStep1, absStep2);
    let micro_step1 = total_micro_step / absStep1;
    let micro_step2 = total_micro_step / absStep2;
    if (absStep1 === 0){
      total_micro_step = absStep2;
      micro_step2 = 1;
      micro_step1 = absStep2 + 100;
    } else if (absStep2 === 0){
      total_micro_step = absStep1;
      micro_step1 = 1;
      micro_step2 = absStep1 + 100;
    }

    for (let i = 0; i < total_micro_step; i++){
      if ((i % micro_step1) === 0 ){
        stepps.push({motor: 1, dir: dir1});
      }
      if ((i % micro_step2) === 0){
        stepps.push({motor: 2, dir: dir2});
      }
    }
    return stepps;
  }
}
