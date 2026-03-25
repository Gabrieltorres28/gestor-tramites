import { ClientAlertType } from '@prisma/client';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { clientAlertTypeLabels, type ClientAlertListItem } from '@/lib/types/app';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getClientAlertState(expiresAt: Date, resolvedAt?: Date | null) {
  if (resolvedAt) {
    return {
      status: 'resolved' as const,
      label: 'Resuelta',
      daysRemaining: null,
    };
  }

  const today = startOfDay(new Date());
  const expiration = startOfDay(expiresAt);
  const daysRemaining = Math.ceil((expiration.getTime() - today.getTime()) / DAY_IN_MS);

  if (daysRemaining < 0) {
    return {
      status: 'expired' as const,
      label: 'Vencida',
      daysRemaining,
    };
  }

  if (daysRemaining <= 7) {
    return {
      status: 'expiring' as const,
      label: 'Por vencer',
      daysRemaining,
    };
  }

  return {
    status: 'active' as const,
    label: 'Vigente',
    daysRemaining,
  };
}

export async function getClientAlerts(businessId: string): Promise<ClientAlertListItem[]> {
  const alerts = await db.clientAlert.findMany({
    where: { businessId },
    include: {
      client: {
        select: {
          id: true,
          fullName: true,
          procedureType: true,
        },
      },
    },
    orderBy: [{ resolvedAt: 'asc' }, { expiresAt: 'asc' }],
  });

  return alerts.map((alert) => {
    const computed = getClientAlertState(alert.expiresAt, alert.resolvedAt);

    return {
      id: alert.id,
      clientId: alert.client.id,
      clientName: alert.client.fullName,
      clientProcedureType: alert.client.procedureType,
      typeKey: alert.type,
      typeLabel: clientAlertTypeLabels[alert.type],
      title: alert.title,
      notes: alert.notes || '',
      startsAt: alert.startsAt ? formatDate(alert.startsAt) : '',
      expiresAt: formatDate(alert.expiresAt),
      createdAt: formatDate(alert.createdAt),
      resolvedAt: alert.resolvedAt ? formatDate(alert.resolvedAt) : '',
      status: computed.status,
      statusLabel: computed.label,
      daysRemaining: computed.daysRemaining,
    };
  });
}

export function getSuggestedAlertTitle(type: ClientAlertType) {
  const suggestions: Record<ClientAlertType, string> = {
    PRESCRIPTION: 'Receta vigente',
    SUBSIDY: 'Subsidio social',
    DOCUMENT: 'Documento a renovar',
    APPOINTMENT: 'Turno pendiente',
    OTHER: 'Seguimiento administrativo',
  };

  return suggestions[type];
}
