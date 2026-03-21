import { AuditAction, CashMovementType, PaymentMethod, ProcedureStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { deleteProcedureSchema, procedureSchema, updateProcedureStatusSchema } from '@/lib/schemas/procedure';
import { createAuditLog } from '@/lib/services/audit.service';
import type { UserContext } from '@/lib/types/app';

function calculateCommission(amountManaged: number, commissionRate: number) {
  return Number(((amountManaged * commissionRate) / 100).toFixed(2));
}

async function createCommissionMovement(user: UserContext, procedureId: string, amount: number, clientName: string) {
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

  const result = await db.$transaction(async (tx) => {
    const procedure = await tx.procedure.create({
      data: {
        businessId: user.businessId,
        clientId: client.id,
        createdByUserId: user.userId,
        type: parsed.data.type,
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
      await tx.cashMovement.create({
        data: {
          businessId: user.businessId,
          createdByUserId: user.userId,
          procedureId: procedure.id,
          type: CashMovementType.COMMISSION_INCOME,
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          description: 'Comisión por trámite de ' + client.fullName,
          amount: commissionAmount,
          movementDate: new Date(),
        },
      });
    }

    return procedure;
  });

  await createAuditLog({
    businessId: user.businessId,
    actorUserId: user.userId,
    entityType: 'procedure',
    entityId: result.id,
    action: AuditAction.CREATE,
    description: 'Alta de trámite.',
    metadata: { clientId: client.id, amountManaged: parsed.data.amountManaged },
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

  await db.$transaction(async (tx) => {
    await tx.procedure.update({
      where: { id: procedure.id },
      data: {
        status: parsed.data.status,
        completedAt: parsed.data.status === ProcedureStatus.IN_PROGRESS ? null : procedure.completedAt || new Date(),
      },
    });

    if (parsed.data.status === ProcedureStatus.PAID) {
      const existingMovement = await tx.cashMovement.findFirst({
        where: {
          businessId: user.businessId,
          procedureId: procedure.id,
          type: CashMovementType.COMMISSION_INCOME,
        },
      });

      if (existingMovement === null) {
        await tx.cashMovement.create({
          data: {
            businessId: user.businessId,
            createdByUserId: user.userId,
            procedureId: procedure.id,
            type: CashMovementType.COMMISSION_INCOME,
            paymentMethod: PaymentMethod.BANK_TRANSFER,
            description: 'Comisión por trámite de ' + procedure.client.fullName,
            amount: procedure.commissionAmount,
            movementDate: new Date(),
          },
        });
      }
    }
  });

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
