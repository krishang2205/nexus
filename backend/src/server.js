const fs = require('fs');
const http = require('http');
const https = require('https');
const { Server } = require('socket.io');
const app = require('./app');
const { PORT, NODE_ENV, ALLOWED_ORIGINS } = require('./config/env');
const { registerSocketHandlers, startInactiveUserCleanup } = require('./socket/registerSocketHandlers');

console.log(`Starting server in ${NODE_ENV} mode on port ${PORT}`);
console.log(`Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);

let server;
if (NODE_ENV === 'production' && process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH) {
  try {
    const sslOptions = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH),
    };

    server = https.createServer(sslOptions, app);
    console.log('HTTPS server created');
  } catch (error) {
    console.error('Failed to load SSL certificates:', error);
    server = http.createServer(app);
    console.log('Falling back to HTTP server');
  }
} else {
  server = http.createServer(app);
  console.log('HTTP server created');
}

const io = new Server(server, {
  cors: {
    origin: NODE_ENV === 'development' ? '*' : ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  allowEIO3: true,
});

registerSocketHandlers(io);
startInactiveUserCleanup(io);

server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
