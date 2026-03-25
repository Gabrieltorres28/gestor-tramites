import { AuditAction } from '@prisma/client';
import { db } from '@/lib/db';
import { clientAlertSchema, deleteClientAlertSchema, resolveClientAlertSchema } from '@/lib/schemas/client-alert';
import { createAuditLog } from '@/lib/services/audit.service';
import type { UserContext } from '@/lib/types/app';

export async function createClientAlert(user: UserContext, input: unknown) {
  const parsed = clientAlertSchema.safeParse(input);

  if (parsed.success === false) {
    return { ok: false as const, message: parsed.error.issues[0]?.message || 'No pudimos guardar la vigencia.' };
  }

  const client = await db.client.findFirst({
    where: { id: parsed.data.clientId, businessId: user.businessId },
    select: { id: true, fullName: true },
  });

  if (client === null) {
    return { ok: false as const, message: 'Cliente no encontrado.' };
  }

  const alert = await db.clientAlert.create({
    data: {
      businessId: user.businessId,
      clientId: client.id,
      createdByUserId: user.userId,
      type: parsed.data.type,
      title: parsed.data.title,
      notes: parsed.data.notes || null,
      startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
      expiresAt: new Date(parsed.data.expiresAt),
    },
  });

  await createAuditLog({
    businessId: user.businessId,
    actorUserId: user.userId,
    entityType: 'client-alert',
    entityId: alert.id,
    action: AuditAction.CREATE,
    description: 'Alta de vigencia.',
    metadata: { clientId: client.id, clientName: client.fullName, title: alert.title, type: alert.type },
  });

  return { ok: true as const };
}

export async function toggleClientAlertResolved(user: UserContext, input: unknown) {
  const parsed = resolveClientAlertSchema.safeParse(input);

  if (parsed.success === false) {
    return { ok: false as const, message: 'Vigencia inválida.' };
  }

  const alert = await db.clientAlert.findFirst({
    where: { id: parsed.data.clientAlertId, businessId: user.businessId },
    select: { id: true, title: true, resolvedAt: true },
  });

  if (alert === null) {
    return { ok: false as const, message: 'Vigencia no encontrada.' };
  }

  const resolvedAt = alert.resolvedAt ? null : new Date();

  await db.clientAlert.update({
    where: { id: alert.id },
    data: { resolvedAt },
  });

  await createAuditLog({
    businessId: user.businessId,
    actorUserId: user.userId,
    entityType: 'client-alert',
    entityId: alert.id,
    action: AuditAction.UPDATE,
    description: resolvedAt ? 'Vigencia marcada como resuelta.' : 'Vigencia reabierta.',
    metadata: { title: alert.title },
  });

  return { ok: true as const };
}

export async function deleteClientAlert(user: UserContext, input: unknown) {
  const parsed = deleteClientAlertSchema.safeParse(input);

  if (parsed.success === false) {
    return { ok: false as const, message: 'Vigencia inválida.' };
  }

  const alert = await db.clientAlert.findFirst({
    where: { id: parsed.data.clientAlertId, businessId: user.businessId },
    select: { id: true, title: true, type: true },
  });

  if (alert === null) {
    return { ok: false as const, message: 'Vigencia no encontrada.' };
  }

  await db.clientAlert.delete({ where: { id: alert.id } });

  await createAuditLog({
    businessId: user.businessId,
    actorUserId: user.userId,
    entityType: 'client-alert',
    entityId: alert.id,
    action: AuditAction.DELETE,
    description: 'Vigencia eliminada.',
    metadata: { title: alert.title, type: alert.type },
  });

  return { ok: true as const };
}
