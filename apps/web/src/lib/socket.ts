import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;
let currentToken: string | null = null;

export function getSocket(token: string): Socket {
  if (socket && currentToken !== token) {
    socket.disconnect();
    socket = null;
  }

  if (!socket || !socket.connected) {
    currentToken = token;
    socket = io(process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001', {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socket;
}

export function reconnectSocket(token: string): Socket {
  disconnectSocket();
  return getSocket(token);
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
  currentToken = null;
}
