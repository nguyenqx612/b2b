import * as repo from '../repositories/vendor-conversation.repository.js';
import * as vendorRepo from '../repositories/vendor.repository.js';
import { LINK_STATUS } from '@b2b/shared';

export async function getOrCreateForSeller(sellerId: string, buyerId: string) {
  const link = await vendorRepo.findLink(buyerId, sellerId);
  if (!link || link.status !== LINK_STATUS.APPROVED) {
    throw Object.assign(new Error('Approved buyer link required'), { status: 403 });
  }
  return repo.getOrCreateConversation(buyerId, sellerId);
}

export async function getOrCreateForBuyer(buyerId: string, sellerId: string) {
  const link = await vendorRepo.findLink(buyerId, sellerId);
  if (!link || (link.status !== LINK_STATUS.APPROVED && link.status !== LINK_STATUS.PENDING)) {
    throw Object.assign(new Error('Vendor link required'), { status: 403 });
  }
  return repo.getOrCreateConversation(buyerId, sellerId);
}

export async function listMessages(conversationId: string, userId: string) {
  await repo.assertParticipant(conversationId, userId);
  return repo.listMessages(conversationId);
}

export async function sendMessage(conversationId: string, senderId: string, body: string) {
  await repo.assertParticipant(conversationId, senderId);
  return repo.sendMessage(conversationId, senderId, body);
}

export async function listForBuyer(buyerId: string) {
  return repo.listForBuyer(buyerId);
}

export async function startFromSeller(sellerId: string, buyerId: string) {
  return getOrCreateForSeller(sellerId, buyerId);
}

export async function startFromBuyer(buyerId: string, sellerId: string) {
  return getOrCreateForBuyer(buyerId, sellerId);
}
