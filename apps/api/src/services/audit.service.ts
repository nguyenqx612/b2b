import type { Request } from 'express';
import { prisma } from '@b2b/db';
import type { Prisma } from '@b2b/db';

type AuditInput = {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
  req?: Request;
};

export async function logAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata,
        ipAddress: input.req?.ip,
      },
    });
  } catch (err) {
    console.error('Failed to write audit log', err);
  }
}
