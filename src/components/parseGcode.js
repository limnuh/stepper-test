
import fs from 'fs';
import readline from 'readline';

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
  let {resolution} = settings;
  const rl = readline.createInterface({
    input: fs.createReadStream(settings.filepath),
    crlfDelay: Infinity
  });

  const ordersArray = [];

  let xPos = 0;
  let yPos = 0;

  rl.on('line', lines => {
    let oldXPos = xPos;
    let oldYPos = yPos;
    console.log('------ ', lines, ' -------' )
    switch(lines.substring(0, 3)) {
      case 'G1F ':
      case '':
      case 'G90': 
        break;
      case 'G20': 
        resolution /= 25.4;
        break;
      case 'G21':
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
  
        [ xPos, yPos ] = XYposition(lines);
        const [ iPos, jPos ] = IJposition(lines);

        const xCenter = oldXPos + iPos;
        const yCenter = oldYPos + jPos;

        const dx = xPos - xCenter;
        const dy = yPos - yCenter;
    
        const r = Math.sqrt( iPos * iPos + jPos * jPos );

        const e1 = [-iPos, -jPos];

        let e2 = [ -e1[1], e1[0] ];
        if ( lines.substring(0, 3) === 'G02' ) {
          e2 = [ e1[1], -e1[0] ];   
        }

        let costheta = ( dx * e1[0] + dy * e1[1] ) / r * r;
        let sintheta = ( dx * e2[0] + dy * e2[1] ) / r * r; 

        if ( costheta > 1) {
          costheta = 1;
        } else if (costheta < -1) {
          costheta = -1;
        }

        let theta = Math.acos(costheta);
        if ( sintheta < 0 ){
          theta = 2.0 * Math.PI - theta;
        }

        let no_step = parseInt( Math.round( r * theta / resolution / 5.0 ) );
console.log(111, {no_step, theta, resolution, r, rrr: (r * theta / resolution / 5.0)})
        for (var i = 1; i <= no_step; i++) {
          const tmp_theta = i * theta / no_step;
          const tmpXPos = xCenter + e1[0] * Math.cos(tmp_theta) + e2[0] * Math.sin(tmp_theta);
          const tmpYPos = yCenter + e1[1] * Math.cos(tmp_theta) + e2[1] * Math.sin(tmp_theta);
          ordersArray.push({type: 'move', xPos: tmpXPos, yPos: tmpYPos});
        }

        break;
    }; 
  });

  rl.on('close', () => {
    console.log('asd', ordersArray)
    next({
      res: resolution,
      ordersArray
    });
  });

}
