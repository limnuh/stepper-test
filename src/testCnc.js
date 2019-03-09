import MotorsControl from './components/MotorsControl';
import parseGcode from './components/parseGcode';
import { argv, option } from 'yargs';

option('filepath', { alias: 'f', default: __dirname + '/example/sample.nc' });
option('manual', { alias: 'm', default: false });
option('delay', { alias: 'd', default: 1 }); //ms

let defaultResolution = 0.04;
const xSeetings = { enPin: 14, dirPin: 15, stepPin: 18, delay: argv.delay, resolution: defaultResolution, name: 'X' };
const ySeetings = { enPin: 16, dirPin: 20, stepPin: 21, delay: argv.delay, resolution: defaultResolution, name: 'Y' };
const toolSeetings = { toolPin: 10, waitingTime: 100 };
const motorsControl = new MotorsControl(xSeetings, ySeetings, toolSeetings);

async function asyncForEach(array, cb, end) {
  for ( let index = 0; index < array.length; index++ ){
    await cb(array[index], index, array);
  }
  end();
}

export default function run(text, drawToScreen = () => {}){
  parseGcode({resolution: defaultResolution, filepath: argv.filepath, text}, ({ordersArray, res}) => {
  
    if(res !== defaultResolution) motorsControl.setResolution(res);
    let stepps = [];
    let prevXPos = 0;
    let prevYPos = 0;
    ordersArray.map(order => {
      if (order.type === 'tool') {
        stepps = stepps.concat({type: 'tool', value: order.value ? true : false });
      }
      if ( order.type === 'move' ) {
        const {xPos, yPos} = order;
        //
        const mStepps = motorsControl.createMotorStepps({xPos, yPos, prevXPos, prevYPos});
        prevXPos = xPos;
        prevYPos = yPos;
  
        if (mStepps) stepps = stepps.concat(mStepps);
      }
    });
    const start = async () => {
      prevXPos = 0;
      prevYPos = 0;
      let xPos = 0;
      let yPos = 0;
      motorsControl.MX.disable(false);
      motorsControl.MY.disable(false);
      asyncForEach(stepps, async (order, index) => {
        prevXPos = motorsControl.MX.position;
        prevYPos = motorsControl.MY.position;
        if(order.type === 1 || order.type === 2) {
          await motorsControl.stepp(order);
          xPos = motorsControl.MX.position;
          yPos = motorsControl.MY.position;
          drawToScreen({prevXPos, prevYPos, xPos, yPos, color: motorsControl.tool.drawState ? 'black' : 'red'});
        }
        if(order.type === 'tool') {
          await motorsControl.tool.draw(order.value);
        }
      }, async () => {
        motorsControl.MX.disable(true);
        motorsControl.MY.disable(true);
        await motorsControl.tool.draw(false);
        motorsControl.tool.disable();
      });
      
    }
  
    start();
  });  
}

if (process.env.CNC) run();