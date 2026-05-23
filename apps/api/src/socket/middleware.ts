import type { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '@b2b/db';
import type { AuthTokenPayload } from '@b2b/shared';

declare module 'socket.io' {
  interface Socket {
    user: AuthTokenPayload;
  }
}

export async function socketAuth(socket: Socket, next: (err?: Error) => void) {
  const token =
    (socket.handshake.auth.token as string | undefined) ??
    (socket.handshake.headers.authorization as string | undefined)?.replace('Bearer ', '');

  if (!token) {
    next(new Error('Authentication required'));
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.API_JWT_SECRET!) as AuthTokenPayload;
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { isActive: true },
    });
    if (!user?.isActive) {
      next(new Error('Account is deactivated'));
      return;
    }
    socket.user = payload;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
}
