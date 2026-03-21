'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminContext } from '@/lib/auth/session';
import { updateBusinessSettings } from '@/lib/services/business-settings.service';

export async function updateBusinessSettingsAction(input: unknown) {
  const user = await requireAdminContext();
  const result = await updateBusinessSettings(user, input);

  if (result.ok) {
    revalidatePath('/');
  }

  return result;
}
