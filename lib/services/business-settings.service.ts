import { AuditAction } from '@prisma/client';
import { db } from '@/lib/db';
import { businessSettingsSchema } from '@/lib/schemas/business-settings';
import { createAuditLog } from '@/lib/services/audit.service';
import type { UserContext } from '@/lib/types/app';

export async function updateBusinessSettings(user: UserContext, input: unknown) {
  const parsed = businessSettingsSchema.safeParse(input);

  if (parsed.success === false) {
    return { ok: false as const, message: parsed.error.issues[0]?.message || 'Datos inválidos.' };
  }

  const settings = await db.businessSettings.update({
    where: { id: user.businessId },
    data: parsed.data,
  });

  await createAuditLog({
    businessId: user.businessId,
    actorUserId: user.userId,
    entityType: 'business_settings',
    entityId: settings.id,
    action: AuditAction.UPDATE,
    description: 'Actualización de configuración del negocio.',
    metadata: parsed.data,
  });

  return { ok: true as const };
}
