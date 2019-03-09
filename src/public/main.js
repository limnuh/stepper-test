'use strict';

(function() {
  console.log('oke')
  var socket = io();
  var canvas = document.getElementsByClassName('whiteboard')[0];
  var runButton = document.getElementById('run');
  var clearButton = document.getElementById('clear');
  var gcodeTextarea = document.getElementById('gcode');
  var context = canvas.getContext('2d');

  runButton.addEventListener('click', onRunCode, false);
  clearButton.addEventListener('click', clearCanvas, false);

  function onRunCode (){
    socket.emit('runCode', { code: gcodeTextarea.value });
  }

  socket.on('runCode', onDrawingEvent);

  window.addEventListener('resize', onResize, false);
  onResize();

  function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }


  function drawLine(x0, y0, x1, y1, color, emit){
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    if (!emit) { return; }
    var w = canvas.width;
    var h = canvas.height;
  }

  const multiple = ({prevXPos, prevYPos, xPos, yPos}, times) => ({ 
    prevXPos: prevXPos * times,
    prevYPos: prevYPos * times,
    xPos: xPos * times,
    yPos: yPos * times
  });

  function onDrawingEvent(data){
    const w = canvas.width;
    const h = canvas.height;
    const {prevXPos, prevYPos, xPos, yPos} = multiple(data, 1);
    drawLine(prevXPos, prevYPos, xPos, yPos, data.color);
  }

  // make the canvas fill its parent
  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

})();