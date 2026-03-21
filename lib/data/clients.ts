import { ClientStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { formatDate, serializeDecimal } from '@/lib/utils';
import { procedureTypeLabels, type ClientListItem } from '@/lib/types/app';

export async function getClients(businessId: string): Promise<ClientListItem[]> {
  const clients = await db.client.findMany({
    where: { businessId },
    orderBy: { createdAt: 'desc' },
  });

  return clients.map((client) => ({
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
  }));
}
