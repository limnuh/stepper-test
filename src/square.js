
import MotorsControl from './components/MotorsControl';
import parseGcode from './components/parseGcode';
import { argv, option } from 'yargs';

option('filepath', { alias: 'f', default: 'sample.nc' });
option('manual', { alias: 'm', default: false });
option('delay', { alias: 'd', default: 10 }); //ms

const resolution = 0.04;
const xSeetings = { enPin: 14, dirPin: 15, stepPin: 18, delay: argv.delay, resolution };
const ySeetings = { enPin: 16, dirPin: 20, stepPin: 21, delay: argv.delay, resolution };
const toolSeetings = { toolPin: 19 };
const motorsControl = new MotorsControl(xSeetings, ySeetings, toolSeetings);

async function asyncForEach(array, cb) {
  for ( let index = 0; index < array.length; index++ ){
    await cb(array[index], index, array)
  }
}

parseGcode({resolution, filepath: argv.filepath}, ordersArray => {
  console.log('ordersArray', ordersArray)
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
    await asyncForEach([...Array(stepps.length).keys()], async (i) => {
      let time_laps = 0;

      if ((i % micro_step1) === 0 ){
        await motor1.stepp(dir1, 1, dt/4);
        time_laps += dt/4.0;
      }
      if ((i % micro_step2) === 0){
        await motor2.stepp(dir2, 1, dt/4);
        time_laps += dt/4.0;
      }
      // time.sleep(dt-time_laps); 
    });
  }

  start();

  console.log(stepps.length)
});
