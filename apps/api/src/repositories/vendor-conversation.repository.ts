import { prisma } from '@b2b/db';

export async function getOrCreateConversation(buyerId: string, sellerId: string) {
  return prisma.vendorConversation.upsert({
    where: { buyerId_sellerId: { buyerId, sellerId } },
    create: { buyerId, sellerId },
    update: {},
  });
}

export async function listMessages(conversationId: string) {
  return prisma.vendorMessage.findMany({
    where: { conversationId },
    include: {
      sender: { select: { email: true, companyName: true, role: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function sendMessage(conversationId: string, senderId: string, body: string) {
  const msg = await prisma.vendorMessage.create({
    data: { conversationId, senderId, body },
    include: {
      sender: { select: { email: true, companyName: true, role: true } },
    },
  });
  await prisma.vendorConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });
  return msg;
}

export async function listForBuyer(buyerId: string) {
  return prisma.vendorConversation.findMany({
    where: { buyerId },
    include: {
      seller: {
        select: {
          companyName: true,
          vendorProfile: { select: { displayName: true, slug: true } },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { sender: { select: { email: true, role: true } } },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getConversationForPair(buyerId: string, sellerId: string) {
  return prisma.vendorConversation.findUnique({
    where: { buyerId_sellerId: { buyerId, sellerId } },
    include: {
      buyer: { select: { email: true, companyName: true } },
      seller: { select: { email: true, companyName: true } },
    },
  });
}

export async function assertParticipant(conversationId: string, userId: string) {
  const conv = await prisma.vendorConversation.findUnique({ where: { id: conversationId } });
  if (!conv) throw Object.assign(new Error('Conversation not found'), { status: 404 });
  if (conv.buyerId !== userId && conv.sellerId !== userId) {
    throw Object.assign(new Error('Access denied'), { status: 403 });
  }
  return conv;
}
