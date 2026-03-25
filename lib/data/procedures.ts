import { db } from '@/lib/db';
import { formatDate, serializeDecimal } from '@/lib/utils';
import { procedureStatusLabels, procedureTypeLabels, type ProcedureListItem } from '@/lib/types/app';

export async function getProcedures(businessId: string): Promise<ProcedureListItem[]> {
  const procedures = await db.procedure.findMany({
    where: { businessId },
    include: {
      client: true,
      cashMovements: {
        where: { type: 'COMMISSION_INCOME' },
        select: { id: true },
      },
    },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  });

  return procedures.map((procedure) => ({
    id: procedure.id,
    clientId: procedure.clientId,
    clientName: procedure.client.fullName,
    type: procedureTypeLabels[procedure.type],
    typeKey: procedure.type,
    status: procedureStatusLabels[procedure.status],
    statusKey: procedure.status,
    amountManaged: serializeDecimal(procedure.amountManaged),
    commissionRate: serializeDecimal(procedure.commissionRate),
    commissionAmount: serializeDecimal(procedure.commissionAmount),
    startedAt: formatDate(procedure.startedAt),
    completedAt: procedure.completedAt ? formatDate(procedure.completedAt) : undefined,
    description: procedure.description || '',
    cashRecorded: procedure.cashMovements.length > 0,
  }));
}
