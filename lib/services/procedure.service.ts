import { AuditAction, CashMovementType, PaymentMethod, ProcedureStatus } from '@prisma/client';
import { db } from '@/lib/db';
import {
  deleteProcedureSchema,
  procedureSchema,
  updateProcedureSchema,
  updateProcedureStatusSchema,
} from '@/lib/schemas/procedure';
import { createAuditLog } from '@/lib/services/audit.service';
import type { UserContext } from '@/lib/types/app';

function calculateCommission(amountManaged: number, commissionRate: number) {
  return Number(((amountManaged * commissionRate) / 100).toFixed(2));
}

async function ensureCommissionMovement(user: UserContext, procedureId: string, amount: number, clientName: string) {
  const existingMovement = await db.cashMovement.findFirst({
    where: {
      businessId: user.businessId,
      procedureId,
      type: CashMovementType.COMMISSION_INCOME,
    },
  });

  if (existingMovement !== null) {
    return;
  }

  await db.cashMovement.create({
    data: {
      businessId: user.businessId,
      createdByUserId: user.userId,
      procedureId,
      type: CashMovementType.COMMISSION_INCOME,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      description: 'Comisión por trámite de ' + clientName,
      amount,
      movementDate: new Date(),
    },
  });
}

export async function createProcedure(user: UserContext, input: unknown) {
  const parsed = procedureSchema.safeParse(input);

  if (parsed.success === false) {
    return { ok: false as const, message: parsed.error.issues[0]?.message || 'Datos inválidos.' };
  }

  const client = await db.client.findFirst({
    where: { id: parsed.data.clientId, businessId: user.businessId },
  });

  if (client === null) {
    return { ok: false as const, message: 'Cliente no encontrado.' };
  }

  const commissionAmount = calculateCommission(parsed.data.amountManaged, parsed.data.commissionRate);

  const procedure = await db.procedure.create({
    data: {
      businessId: user.businessId,
      clientId: client.id,
      createdByUserId: user.userId,
      type: client.procedureType,
      status: parsed.data.status,
      amountManaged: parsed.data.amountManaged,
      commissionRate: parsed.data.commissionRate,
      commissionAmount,
      startedAt: new Date(parsed.data.startedAt),
      completedAt: parsed.data.status === ProcedureStatus.IN_PROGRESS ? null : new Date(),
      description: parsed.data.description || null,
    },
  });

  if (parsed.data.status === ProcedureStatus.PAID) {
    await ensureCommissionMovement(user, procedure.id, commissionAmount, client.fullName);
  }

  await createAuditLog({
    businessId: user.businessId,
    actorUserId: user.userId,
    entityType: 'procedure',
    entityId: procedure.id,
    action: AuditAction.CREATE,
    description: 'Alta de trámite.',
    metadata: {
      clientId: client.id,
      amountManaged: parsed.data.amountManaged,
      type: client.procedureType,
    },
  });

  return { ok: true as const };
}

export async function updateProcedure(user: UserContext, input: unknown) {
  const parsed = updateProcedureSchema.safeParse(input);

  if (parsed.success === false) {
    return { ok: false as const, message: parsed.error.issues[0]?.message || 'Datos inválidos.' };
  }

  const procedure = await db.procedure.findFirst({
    where: { id: parsed.data.procedureId, businessId: user.businessId },
    include: { client: true },
  });

  if (procedure === null) {
    return { ok: false as const, message: 'Trámite no encontrado.' };
  }

  const commissionAmount = calculateCommission(parsed.data.amountManaged, parsed.data.commissionRate);

  await db.procedure.update({
    where: { id: procedure.id },
    data: {
      amountManaged: parsed.data.amountManaged,
      commissionRate: parsed.data.commissionRate,
      commissionAmount,
      startedAt: new Date(parsed.data.startedAt),
      description: parsed.data.description || null,
    },
  });

  if (procedure.status === ProcedureStatus.PAID) {
    const movement = await db.cashMovement.findFirst({
      where: {
        businessId: user.businessId,
        procedureId: procedure.id,
        type: CashMovementType.COMMISSION_INCOME,
      },
    });

    if (movement !== null) {
      await db.cashMovement.update({
        where: { id: movement.id },
        data: {
          amount: commissionAmount,
          description: 'Comisión por trámite de ' + procedure.client.fullName,
        },
      });
    } else {
      await ensureCommissionMovement(user, procedure.id, commissionAmount, procedure.client.fullName);
    }
  }

  await createAuditLog({
    businessId: user.businessId,
    actorUserId: user.userId,
    entityType: 'procedure',
    entityId: procedure.id,
    action: AuditAction.UPDATE,
    description: 'Edición de trámite.',
    metadata: {
      amountManaged: parsed.data.amountManaged,
      commissionRate: parsed.data.commissionRate,
    },
  });

  return { ok: true as const };
}

export async function updateProcedureStatus(user: UserContext, input: unknown) {
  const parsed = updateProcedureStatusSchema.safeParse(input);

  if (parsed.success === false) {
    return { ok: false as const, message: 'Estado inválido.' };
  }

  const procedure = await db.procedure.findFirst({
    where: { id: parsed.data.procedureId, businessId: user.businessId },
    include: { client: true },
  });

  if (procedure === null) {
    return { ok: false as const, message: 'Trámite no encontrado.' };
  }

  await db.procedure.update({
    where: { id: procedure.id },
    data: {
      status: parsed.data.status,
      completedAt: parsed.data.status === ProcedureStatus.IN_PROGRESS ? null : procedure.completedAt || new Date(),
    },
  });

  if (parsed.data.status === ProcedureStatus.PAID) {
    await ensureCommissionMovement(user, procedure.id, Number(procedure.commissionAmount), procedure.client.fullName);
  }

  await createAuditLog({
    businessId: user.businessId,
    actorUserId: user.userId,
    entityType: 'procedure',
    entityId: procedure.id,
    action: AuditAction.UPDATE,
    description: 'Cambio de estado de trámite.',
    metadata: { status: parsed.data.status },
  });

  return { ok: true as const };
}

export async function deleteProcedure(user: UserContext, input: unknown) {
  const parsed = deleteProcedureSchema.safeParse(input);

  if (parsed.success === false) {
    return { ok: false as const, message: 'Trámite inválido.' };
  }

  const procedure = await db.procedure.findFirst({
    where: { id: parsed.data.procedureId, businessId: user.businessId },
  });

  if (procedure === null) {
    return { ok: false as const, message: 'Trámite no encontrado.' };
  }

  await db.procedure.delete({ where: { id: procedure.id } });

  await createAuditLog({
    businessId: user.businessId,
    actorUserId: user.userId,
    entityType: 'procedure',
    entityId: procedure.id,
    action: AuditAction.DELETE,
    description: 'Baja de trámite.',
  });

  return { ok: true as const };
}
