import MotorsControl from './components/MotorsControl';
import parseGcode from './components/parseGcode';
import { argv, option } from 'yargs';

option('filepath', { alias: 'f', default: 'sample.nc' });
option('manual', { alias: 'm', default: false });
option('delay', { alias: 'd', default: 100 }); //ms

const resolution = 0.04;
const xSeetings = { enPin: 14, dirPin: 15, stepPin: 18, delay: argv.delay, resolution, name: 'X' };
const ySeetings = { enPin: 16, dirPin: 20, stepPin: 21, delay: argv.delay, resolution, name: 'Y' };
const toolSeetings = { toolPin: 19 };
const motorsControl = new MotorsControl(xSeetings, ySeetings, toolSeetings);

async function asyncForEach(array, cb) {
  for ( let index = 0; index < array.length; index++ ){
    await cb(array[index], index, array)
  }
}

function sleep(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

parseGcode({resolution, filepath: argv.filepath}, ordersArray => {
  let stepps = [];
  ordersArray.map(order => {
    //laser ....
    if ( order.type === 'move' ) {
      const {xPos, dx, yPos, dy} = order;
      const mStepps = motorsControl.createMotorStepps({xPos, dx, yPos, dy})
      if (mStepps) stepps = stepps.concat(mStepps);
    }
  });

  const start = async () => {
    asyncForEach(stepps, async (order, index) => {
      await motorsControl.stepp({...order});
    });
  }

  start();

  console.log(stepps.length)
});
