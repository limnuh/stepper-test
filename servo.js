var piblaster = require("pi-blaster.js");

setLeft()

function setLeft(){
  setTimeout(() => {
    piblaster.setPwm(10, 0.05);
    setRight();
  }, 1000);
}

function setRight(){
  setTimeout(() => {
    piblaster.setPwm(10, 0.25);
    setLeft();
  }, 1000);
}