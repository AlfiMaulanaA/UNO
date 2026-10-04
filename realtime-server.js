import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupSocketServer } from './src/server/socketServer.js';

const port = process.env.PORT || 4000;
const corsOrigin = process.env.CORS_ORIGIN || '*';

const httpServer = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ColorCards Realtime WebSocket Server OK\n');
});

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST']
  }
});

setupSocketServer(io);

httpServer.listen(port, () => {
  console.log(`> Standalone ColorCards Realtime Server running on port ${port}`);
});
