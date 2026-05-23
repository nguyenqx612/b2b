import type { Socket, Server } from 'socket.io';
import { prisma } from '@b2b/db';

export function registerMessageHandlers(io: Server, socket: Socket) {
  // Client emits 'join:po' to subscribe to a PO thread
  socket.on('join:po', async (poId: string) => {
    if (typeof poId !== 'string' || !poId) {
      socket.emit('error', { message: 'Invalid PO id' });
      return;
    }

    // Verify the user is a participant in this PO
    const po = await prisma.purchaseOrder.findFirst({
      where: {
        id: poId,
        OR: [{ buyerId: socket.user.sub }, { sellerId: socket.user.sub }],
      },
      select: { id: true },
    });

    if (!po && socket.user.role !== 'admin') {
      socket.emit('error', { message: 'Access denied to this PO' });
      return;
    }

    socket.join(`po:${poId}`);
    socket.emit('joined:po', { poId });
  });

  socket.on('leave:po', (poId: string) => {
    socket.leave(`po:${poId}`);
  });

  socket.on('message:send', async (data: { poId: string; body: string }) => {
    if (typeof data?.poId !== 'string' || typeof data?.body !== 'string') {
      socket.emit('error', { message: 'Invalid message payload' });
      return;
    }
    if (!socket.rooms.has(`po:${data.poId}`)) {
      socket.emit('error', { message: 'Join the PO room before sending messages' });
      return;
    }

    try {
      const message = await prisma.message.create({
        data: {
          poId: data.poId,
          senderId: socket.user.sub,
          messageType: 'text',
          body: data.body.trim().slice(0, 10000),
        },
        include: {
          sender: { select: { email: true, companyName: true, role: true } },
        },
      });

      io.to(`po:${data.poId}`).emit('message:new', message);
    } catch (err) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('typing:start', (poId: string) => {
    if (!socket.rooms.has(`po:${poId}`)) return;
    socket.to(`po:${poId}`).emit('typing:start', {
      userId: socket.user.sub,
      email: socket.user.email,
    });
  });

  socket.on('typing:stop', (poId: string) => {
    if (!socket.rooms.has(`po:${poId}`)) return;
    socket.to(`po:${poId}`).emit('typing:stop', { userId: socket.user.sub });
  });
}
