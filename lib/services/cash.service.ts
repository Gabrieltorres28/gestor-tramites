import { AuditAction, CashMovementType } from '@prisma/client';
import { db } from '@/lib/db';
import { cashMovementSchema, deleteCashMovementSchema } from '@/lib/schemas/cash-movement';
import { createAuditLog } from '@/lib/services/audit.service';
import type { UserContext } from '@/lib/types/app';

function normalizeAmount(type: CashMovementType, amount: number) {
  if (type === CashMovementType.COMMISSION_INCOME || type === CashMovementType.CLIENT_INCOME) {
    return Math.abs(amount);
  }

  return Math.abs(amount) * -1;
}

export async function createCashMovement(user: UserContext, input: unknown) {
  const parsed = cashMovementSchema.safeParse(input);

  if (parsed.success === false) {
    return { ok: false as const, message: parsed.error.issues[0]?.message || 'Datos inválidos.' };
  }

  const movement = await db.cashMovement.create({
    data: {
      businessId: user.businessId,
      createdByUserId: user.userId,
      type: parsed.data.type,
      paymentMethod: parsed.data.paymentMethod,
      description: parsed.data.description,
      amount: normalizeAmount(parsed.data.type, parsed.data.amount),
      movementDate: new Date(parsed.data.movementDate),
    },
  });

  await createAuditLog({
    businessId: user.businessId,
    actorUserId: user.userId,
    entityType: 'cash_movement',
    entityId: movement.id,
    action: AuditAction.CREATE,
    description: 'Alta de movimiento de caja.',
    metadata: { type: movement.type, amount: movement.amount.toString() },
  });

  return { ok: true as const };
}

export async function deleteCashMovement(user: UserContext, input: unknown) {
  const parsed = deleteCashMovementSchema.safeParse(input);

  if (parsed.success === false) {
    return { ok: false as const, message: 'Movimiento inválido.' };
  }

  const movement = await db.cashMovement.findFirst({
    where: { id: parsed.data.movementId, businessId: user.businessId },
  });

  if (movement === null) {
    return { ok: false as const, message: 'Movimiento no encontrado.' };
  }

  await db.cashMovement.delete({ where: { id: movement.id } });

  await createAuditLog({
    businessId: user.businessId,
    actorUserId: user.userId,
    entityType: 'cash_movement',
    entityId: movement.id,
    action: AuditAction.DELETE,
    description: 'Baja de movimiento de caja.',
  });

  return { ok: true as const };
}
