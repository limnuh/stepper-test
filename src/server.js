import express from 'express';
import http from 'http';
import cnc from './testCnc';

const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

function onConnection(socket){
  socket.on('runCode', (text) => {
    cnc(text.code, (lineSettings) => {
      socket.emit('runCode', lineSettings);
    });
  });
}

io.on('connection', onConnection);

server.listen(port, () => console.log('listening on port ' + port));
