import { AuditAction, ClientStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { clientSchema, deleteClientSchema } from '@/lib/schemas/client';
import { createAuditLog } from '@/lib/services/audit.service';
import type { UserContext } from '@/lib/types/app';

export async function createClient(user: UserContext, input: unknown) {
  const parsed = clientSchema.safeParse(input);

  if (parsed.success === false) {
    return { ok: false as const, message: parsed.error.issues[0]?.message || 'Datos inválidos.' };
  }

  const client = await db.client.create({
    data: {
      businessId: user.businessId,
      createdByUserId: user.userId,
      fullName: parsed.data.fullName,
      dni: parsed.data.dni,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      notes: parsed.data.notes || null,
      status: ClientStatus.ACTIVE,
      procedureType: parsed.data.procedureType,
      commissionRate: parsed.data.commissionRate,
    },
  });

  await createAuditLog({
    businessId: user.businessId,
    actorUserId: user.userId,
    entityType: 'client',
    entityId: client.id,
    action: AuditAction.CREATE,
    description: 'Alta de cliente.',
    metadata: { dni: client.dni, fullName: client.fullName },
  });

  return { ok: true as const };
}

export async function deleteClient(user: UserContext, input: unknown) {
  const parsed = deleteClientSchema.safeParse(input);

  if (parsed.success === false) {
    return { ok: false as const, message: 'Cliente inválido.' };
  }

  const client = await db.client.findFirst({
    where: { id: parsed.data.clientId, businessId: user.businessId },
  });

  if (client === null) {
    return { ok: false as const, message: 'Cliente no encontrado.' };
  }

  await db.client.delete({ where: { id: client.id } });

  await createAuditLog({
    businessId: user.businessId,
    actorUserId: user.userId,
    entityType: 'client',
    entityId: client.id,
    action: AuditAction.DELETE,
    description: 'Baja de cliente.',
    metadata: { fullName: client.fullName, dni: client.dni },
  });

  return { ok: true as const };
}
