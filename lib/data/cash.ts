import { db } from '@/lib/db';
import { formatDate, serializeDecimal } from '@/lib/utils';
import { cashMovementTypeLabels, paymentMethodLabels, type CashMovementListItem } from '@/lib/types/app';

export async function getCashMovements(businessId: string): Promise<CashMovementListItem[]> {
  const movements = await db.cashMovement.findMany({
    where: { businessId },
    orderBy: { movementDate: 'desc' },
  });

  return movements.map((movement) => ({
    id: movement.id,
    type: cashMovementTypeLabels[movement.type],
    paymentMethod: paymentMethodLabels[movement.paymentMethod],
    description: movement.description,
    amount: serializeDecimal(movement.amount),
    movementDate: formatDate(movement.movementDate),
    procedureId: movement.procedureId || undefined,
  }));
}
