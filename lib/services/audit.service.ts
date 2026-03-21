import { AuditAction, Prisma } from '@prisma/client';
import { db } from '@/lib/db';

type CreateAuditLogInput = {
  businessId: string;
  actorUserId?: string;
  entityType: string;
  entityId?: string;
  action: AuditAction;
  description: string;
  metadata?: Prisma.InputJsonValue;
};

export async function createAuditLog(input: CreateAuditLogInput) {
  await db.auditLog.create({
    data: {
      businessId: input.businessId,
      actorUserId: input.actorUserId,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      description: input.description,
      metadata: input.metadata,
    },
  });
}
