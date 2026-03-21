'use server';

import { revalidatePath } from 'next/cache';
import { requireUserContext } from '@/lib/auth/session';
import { createProcedure, deleteProcedure, updateProcedureStatus } from '@/lib/services/procedure.service';

export async function createProcedureAction(input: unknown) {
  const user = await requireUserContext();
  const result = await createProcedure(user, input);

  if (result.ok) {
    revalidatePath('/tramites');
    revalidatePath('/libro-diario');
    revalidatePath('/');
  }

  return result;
}

export async function updateProcedureStatusAction(input: unknown) {
  const user = await requireUserContext();
  const result = await updateProcedureStatus(user, input);

  if (result.ok) {
    revalidatePath('/tramites');
    revalidatePath('/libro-diario');
    revalidatePath('/');
  }

  return result;
}

export async function deleteProcedureAction(input: unknown) {
  const user = await requireUserContext();
  const result = await deleteProcedure(user, input);

  if (result.ok) {
    revalidatePath('/tramites');
    revalidatePath('/libro-diario');
    revalidatePath('/');
  }

  return result;
}
