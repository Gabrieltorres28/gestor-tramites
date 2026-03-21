'use server';

import { revalidatePath } from 'next/cache';
import { requireUserContext } from '@/lib/auth/session';
import { createCashMovement, deleteCashMovement } from '@/lib/services/cash.service';

export async function createCashMovementAction(input: unknown) {
  const user = await requireUserContext();
  const result = await createCashMovement(user, input);

  if (result.ok) {
    revalidatePath('/libro-diario');
    revalidatePath('/');
  }

  return result;
}

export async function deleteCashMovementAction(input: unknown) {
  const user = await requireUserContext();
  const result = await deleteCashMovement(user, input);

  if (result.ok) {
    revalidatePath('/libro-diario');
    revalidatePath('/');
  }

  return result;
}
