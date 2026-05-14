import 'dotenv/config';
import http from 'node:http';
import { createApp } from './app.js';
import { initSocketServer } from './socket/index.js';
import { prisma } from '@b2b/db';

const PORT = Number(process.env.API_PORT ?? 3001);

async function main() {
  await prisma.$connect();
  console.log('Database connected');

  const app = createApp();
  const server = http.createServer(app);

  initSocketServer(server);

  server.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
