
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

  rl.on('line', lines => {
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
        const [ xPos, yPos ] = XYposition(lines);
        ordersArray.push({type: 'move', xPos, yPos});
        
        break;
    }; 
        
    // elif (lines[0:3]=='G02')|(lines[0:3]=='G03'): #circular interpolation
    //     if (lines.find('X') != -1 and lines.find('Y') != -1 and lines.find('I') != -1 and lines.find('J') != -1):
    //         laseron()
    //         old_x_pos=x_pos;
    //         old_y_pos=y_pos;
  
    //         [x_pos,y_pos]=XYposition(lines);
    //         [i_pos,j_pos]=IJposition(lines);
  
    //         xcenter=old_x_pos+i_pos;   #center of the circle for interpolation
    //         ycenter=old_y_pos+j_pos;
        
        
    //         Dx=x_pos-xcenter;
    //         Dy=y_pos-ycenter;      #vector [Dx,Dy] points from the circle center to the new position
        
    //         r=sqrt(i_pos**2+j_pos**2);   # radius of the circle
        
    //         e1=[-i_pos,-j_pos]; #pointing from center to current position
    //         if (lines[0:3]=='G02'): #clockwise
    //             e2=[e1[1],-e1[0]];      #perpendicular to e1. e2 and e1 forms x-y system (clockwise)
    //         else:                   #counterclockwise
    //             e2=[-e1[1],e1[0]];      #perpendicular to e1. e1 and e2 forms x-y system (counterclockwise)
  
    //         #[Dx,Dy]=e1*cos(theta)+e2*sin(theta), theta is the open angle
  
    //         costheta=(Dx*e1[0]+Dy*e1[1])/r**2;
    //         sintheta=(Dx*e2[0]+Dy*e2[1])/r**2;        #theta is the angule spanned by the circular interpolation curve
                
    //         if costheta>1:  # there will always be some numerical errors! Make sure abs(costheta)<=1
    //             costheta=1;
    //         elif costheta<-1:
    //             costheta=-1;
  
    //         theta=arccos(costheta);
    //         if sintheta<0:
    //             theta=2.0*pi-theta;
  
    //         no_step=int(round(r*theta/dx/5.0));   # number of point for the circular interpolation
            
    //         for i in range(1,no_step+1):
    //             tmp_theta=i*theta/no_step;
    //             tmp_x_pos=xcenter+e1[0]*cos(tmp_theta)+e2[0]*sin(tmp_theta);
    //             tmp_y_pos=ycenter+e1[1]*cos(tmp_theta)+e2[1]*sin(tmp_theta);
    //             moveto(MX,tmp_x_pos,dx,MY, tmp_y_pos,dy,speed,True);
  });

  rl.on('close', () => {
    next({
      res: resolution,
      ordersArray
    });
  })
  
}
