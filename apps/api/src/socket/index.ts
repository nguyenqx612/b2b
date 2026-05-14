import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { socketAuth } from './middleware.js';
import { registerMessageHandlers } from './handlers/messageHandler.js';

export function initSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL ?? 'http://localhost:3000',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Redis adapter for horizontal scaling across ECS tasks
  const pubClient = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));

  io.use(socketAuth);

  io.on('connection', (socket) => {
    console.log(`WS connected: ${socket.user.email} (${socket.id})`);
    registerMessageHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`WS disconnected: ${socket.user.email}`);
    });
  });

  return io;
}
