'use server';

import { revalidatePath } from 'next/cache';
import { requireUserContext } from '@/lib/auth/session';
import { createClient, deleteClient } from '@/lib/services/client.service';

export async function createClientAction(input: unknown) {
  const user = await requireUserContext();
  const result = await createClient(user, input);

  if (result.ok) {
    revalidatePath('/clientes');
    revalidatePath('/tramites');
    revalidatePath('/');
  }

  return result;
}

export async function deleteClientAction(input: unknown) {
  const user = await requireUserContext();
  const result = await deleteClient(user, input);

  if (result.ok) {
    revalidatePath('/clientes');
    revalidatePath('/tramites');
    revalidatePath('/libro-diario');
    revalidatePath('/');
  }

  return result;
}
