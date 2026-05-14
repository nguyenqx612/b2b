import type { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import type { AuthTokenPayload } from '@b2b/shared';

declare module 'socket.io' {
  interface Socket {
    user: AuthTokenPayload;
  }
}

export function socketAuth(socket: Socket, next: (err?: Error) => void) {
  const token =
    (socket.handshake.auth.token as string | undefined) ??
    (socket.handshake.headers.authorization as string | undefined)?.replace('Bearer ', '');

  if (!token) {
    next(new Error('Authentication required'));
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.API_JWT_SECRET!) as AuthTokenPayload;
    socket.user = payload;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
}
