import MotorsControl from './components/MotorsControl';
import parseGcode from './components/parseGcode';
import { argv, option } from 'yargs';

option('filepath', { alias: 'f', default: __dirname + '/example/sample.nc' });
option('manual', { alias: 'm', default: false });
option('delay', { alias: 'd', default: 2 }); //ms

let defaultResolution = 0.04;
const xSeetings = { enPin: 14, dirPin: 15, stepPin: 18, delay: argv.delay, resolution: defaultResolution, name: 'X' };
const ySeetings = { enPin: 16, dirPin: 20, stepPin: 21, delay: argv.delay, resolution: defaultResolution, name: 'Y' };
const toolSeetings = { toolPin: 19 };
const motorsControl = new MotorsControl(xSeetings, ySeetings, toolSeetings);

async function asyncForEach(array, cb) {
  for ( let index = 0; index < array.length; index++ ){
    await cb(array[index], index, array);
  }
}

export default function run(text, draw = () => {}){
  parseGcode({resolution: defaultResolution, filepath: argv.filepath, text}, ({ordersArray, res}) => {
  
    if(res !== defaultResolution) motorsControl.setResolution(res);
    let stepps = [];
    let prevXPos = 0;
    let prevYPos = 0;
    ordersArray.map(order => {
      //laser ....
      if ( order.type === 'move' ) {
        const {xPos, yPos} = order;
        draw(prevXPos, prevYPos, xPos, yPos)
        const mStepps = motorsControl.createMotorStepps({xPos, yPos, prevXPos, prevYPos});
        prevXPos = xPos;
        prevYPos = yPos;
  
        if (mStepps) stepps = stepps.concat(mStepps);
      }
    });
    const start = async () => {
      asyncForEach(stepps, async (order, index) => {
        await motorsControl.stepp({...order});
      });
    }
  
    start();
  });  
}

if (process.env.CNC) run();