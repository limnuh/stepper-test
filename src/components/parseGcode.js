
import fs from 'fs';
import readline from 'readline';
import stream from 'stream';

//grbl
const DEFAULT_ARC_TOLERANCE = 0.002;
const ARC_ANGULAR_TRAVEL_EPSILON = 5E-7;
const M_PI = 3.14159265358979323846;
const N_ARC_CORRECTION = 12;
//

const ord = (str) => {
  if (!str) return false;
  return str.charCodeAt(0);
};

const isANumber = number => ( number && (47 < ord(number) < 58) ) || (number === '.') || (number === '-');

const XYposition = (lines) => {
  let i;
  const xchar_loc = lines.indexOf('X');
  i = xchar_loc + 1;
  while(isANumber(lines[i])){
    i++;
  }
  const x_pos = parseFloat(lines.substring(xchar_loc + 1, i));
  
  const ychar_loc = lines.indexOf('Y');
  i = ychar_loc + 1;
  while(isANumber(lines[i])){
    i += 1;
  }
  const y_pos = parseFloat(lines.substring(ychar_loc + 1, i));

  return [x_pos, y_pos];
}

const IJposition = lines => {
  const ichar_loc = lines.indexOf('I');
  let i;
  i = ichar_loc + 1;
  while(isANumber(lines[i])){
    i += 1;
  }
  const i_pos = parseFloat(lines.substring(ichar_loc + 1, i));   
  
  const jchar_loc = lines.indexOf('J');
  i = jchar_loc + 1;
  while(isANumber(lines[i])){
    i += 1;
  }
  const j_pos = parseFloat(lines.substring(jchar_loc + 1, i));   

  return [i_pos, j_pos];
}

export default function parseGcode(settings, next) {
  let { resolution } = settings;
  let input;
  if (settings.text) {
    const buf = Buffer.from(settings.text);
    var bufferStream = new stream.PassThrough();
    bufferStream.end(buf);
    input = bufferStream;
  } else {
    input = fs.createReadStream(settings.filepath)
  }
  const rl = readline.createInterface({
    input,
    crlfDelay: Infinity
  });

  const ordersArray = [];

  let xPos = 0;
  let yPos = 0;

  rl.on('line', lines => {
    let oldXPos = xPos;
    let oldYPos = yPos;
    switch(lines.substring(0, 3)) {
      case 'G1F ':
      case '':
      case 'G90': 
      case 'G21':
        break;
      case 'G20': 
        resolution /= 25.4;
        break;
      case 'M02':
      case 'M2 ':
      case 'M05':
      case 'M5 ':
      case 'M5':
      ordersArray.push({type: 'tool', value: 0});
        break;
      case 'M3':
      case 'M03':
      case 'M4':
      case 'M04':
      ordersArray.push({type: 'tool', value: 1});
        break;
      case 'G00':
      case 'G1 ':
      case 'G01':
        if (lines.indexOf('X') === -1 || lines.indexOf('Y') === -1) {
          break;
        }
        if (lines.substring(0, 3) === 'G00'){
          ordersArray.push({type: 'tool', value: 0});
        }
        [ xPos, yPos ] = XYposition(lines);
        ordersArray.push({type: 'move', xPos, yPos});
        
        break;
      case 'G02':
      case 'G2 ':
      case 'G03':
      case 'G3 ':
        if (lines.indexOf('X') === -1 || lines.indexOf('Y') === -1 || lines.indexOf('I') === -1 || lines.indexOf('J') === -1) {
          break;
        }
// https://github.com/zxzhaixiang/Laser_engraver_system_RaspberryPI/blob/master/Gcode_executer.py#L194
// https://github.com/grbl/grbl/blob/master/grbl/motion_control.c#L112
// { position, target, offset, radius }
        [ xPos, yPos ] = XYposition(lines);
        const [ iPos, jPos ] = IJposition(lines);
        const xCenter = oldXPos + iPos;
        const yCenter = oldYPos + jPos;
        const center_axis0 = oldXPos + iPos;
        const center_axis1 = oldYPos + jPos;
        let r_axis0 = -iPos;  // Radius vector from center to current location
        let r_axis1 = -jPos;
        const rt_axis0 = xPos - center_axis0;
        const rt_axis1 = yPos - center_axis1;
        const radius = Math.sqrt( iPos * iPos + jPos * jPos );
        let angular_travel = Math.atan2(r_axis0 * rt_axis1 - r_axis1 * rt_axis0, r_axis0 * rt_axis0 + r_axis1 * rt_axis1);
        let is_clockwise_arc = false;
        
        if ( lines.substring(0, 3) === 'G02' || lines.substring(0, 3) === 'G2 ' ) {
          is_clockwise_arc = true;
        }

        if ( is_clockwise_arc ) { // Correct atan2 output per direction
          if (angular_travel >= -ARC_ANGULAR_TRAVEL_EPSILON) { angular_travel -= 2 * M_PI; }
        } else {
          if (angular_travel <= ARC_ANGULAR_TRAVEL_EPSILON) { angular_travel += 2 * M_PI; }
        }

        const segments = Math.floor(Math.abs( 0.5 * angular_travel * radius ) / Math.sqrt( DEFAULT_ARC_TOLERANCE * ( 2 * radius - DEFAULT_ARC_TOLERANCE)) );
  
        if (!segments) {
          ordersArray.push({type: 'move', xPos, yPos});
          break;
        }
        const theta_per_segment = angular_travel / segments;
        let cos_T = 2.0 - theta_per_segment * theta_per_segment;
        const sin_T = theta_per_segment * 0.16666667 * ( cos_T + 4.0 );
        cos_T *= 0.5;

        let sin_Ti;
        let cos_Ti;
        let r_axisi;
        let i;
        let count = 0;
      
        for (i = 1; i < segments; i++) { // Increment (segments-1).
          
          if (count < N_ARC_CORRECTION) {
            r_axisi = r_axis0 * sin_T + r_axis1 * cos_T;
            r_axis0 = r_axis0 * cos_T - r_axis1 * sin_T;
            r_axis1 = r_axisi;
            count++;
          } else {      
            cos_Ti = Math.cos( i * theta_per_segment );
            sin_Ti = Math.sin( i * theta_per_segment );
            r_axis0 = -iPos * cos_Ti + jPos * sin_Ti;
            r_axis1 = -iPos * sin_Ti - jPos * cos_Ti;
            count = 0;
          }
      
          const tmpXPos = center_axis0 + r_axis0;
          const tmpYPos = center_axis1 + r_axis1;
          ordersArray.push({type: 'move', xPos: tmpXPos, yPos: tmpYPos});

        }
        break;

//        
    }; 
  });

  rl.on('close', () => {
    next({
      res: resolution,
      ordersArray
    });
  });

}
