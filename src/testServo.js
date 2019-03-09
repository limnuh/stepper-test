var piblaster = require("pi-blaster.js");

const pin = 10;

function range(percent){
  if(typeof percent === 'boolean' && !percent){
    return 0;
  }
  return 0.002 * percent + 0.05;
}

setLeft()

function setLeft(){
  setTimeout(() => {
    piblaster.setPwm(pin, range(0));
    setRight();
  }, 1000);
}

function setRight(){
  setTimeout(() => {
    piblaster.setPwm(pin, range(30));
    setLeft();
  }, 1000);
}
 