import { ClientStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { formatDate, serializeDecimal } from '@/lib/utils';
import { procedureTypeLabels, type ClientListItem } from '@/lib/types/app';
import { getClientAlertState } from '@/lib/data/client-alerts';

export async function getClients(businessId: string): Promise<ClientListItem[]> {
  const clients = await db.client.findMany({
    where: { businessId },
    orderBy: { createdAt: 'desc' },
    include: {
      clientAlerts: {
        where: { resolvedAt: null },
        orderBy: { expiresAt: 'asc' },
        take: 1,
      },
      _count: {
        select: {
          clientAlerts: {
            where: { resolvedAt: null },
          },
        },
      },
    },
  });

  return clients.map((client) => {
    const nextAlert = client.clientAlerts[0];
    const computed = nextAlert ? getClientAlertState(nextAlert.expiresAt, nextAlert.resolvedAt) : null;

    return {
      id: client.id,
      fullName: client.fullName,
      dni: client.dni,
      phone: client.phone || '',
      email: client.email || '',
      notes: client.notes || '',
      status: client.status === ClientStatus.ACTIVE ? 'Activo' : 'Inactivo',
      procedureType: procedureTypeLabels[client.procedureType],
      commissionRate: serializeDecimal(client.commissionRate),
      createdAt: formatDate(client.createdAt),
      activeAlertsCount: client._count.clientAlerts,
      nextAlertTitle: nextAlert?.title || '',
      nextAlertDate: nextAlert ? formatDate(nextAlert.expiresAt) : '',
      nextAlertStatus: computed?.status || 'none',
      nextAlertStatusLabel: computed?.label || 'Sin vigencias',
    };
  });
}
