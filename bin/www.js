#!/usr/bin/env node

/**
 * Module dependencies.
 */
require('dotenv').config();
const debug = require('debug')('grammi-api:server');
const http = require('http');


const app = require('../app');
const connectDb = require('../database/mongoConnection');

let port = '36200';

/**
 * Normalize a port into a number, string, or false.
 */

const normalizePort = (val) => {
  port = parseInt(val, 10);

  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

/**
 * Event listener for HTTP server "error" event.
 */

const onError = (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      debug(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      debug(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

/**
 * Get port from environment and store in Express.
 */

port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);
// Socket Connection and setting it globally
// const io = require('socket.io')(server,{path : '/api/v1/socket'});

// global.io = io;
// const redis = require('socket.io-redis');

// io.adapter(redis({ host: process.env.redisHost, port: process.env.redisPort }));

app.use((req, res, next) => {
  // req.io = io;
  if (req.headers.origin) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE');
    if (req.method === 'OPTIONS') return res.send(200);
  }
  return next();
});

// io.sockets.on('connection', (socket) => {
//   console.log('Connected');
//   // socket.on('riderstory', function(data){
//   //   console.log("Data in Socket",data)
//   // })
//   socket.on('disconnect', (data) => {
//     // console.log("socketio disconnect...");
//   });
// });
/**
 * Event listener for HTTP server "listening" event.
 */

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
};
/**
 * Listen on provided port, on all network interfaces.
 */
connectDb().then(async () => {
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);
}).catch((err) => {
  debug(`Server not started ${err.message}`);
});
