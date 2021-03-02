if (process.env.NODE_ENV !== 'production') require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: {} });
require('./chat')(io);

app.use(express.static(path.resolve('public')));

const port = process.env.PORT || 3000;
server.listen(port, () => console.log('Listening on port ' + port));