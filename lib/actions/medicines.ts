'use server';

import { revalidatePath } from 'next/cache';
import { requireUserContext } from '@/lib/auth/session';
import { createMedicine, createMedicineBatch, deleteMedicine, deleteMedicineBatch, sellMedicine } from '@/lib/services/medicine.service';

function refresh() {
  revalidatePath('/medicamentos');
  revalidatePath('/');
}

export async function createMedicineAction(input: unknown) {
  const user = await requireUserContext();
  const result = await createMedicine(user, input);
  if (result.ok) refresh();
  return result;
}

export async function deleteMedicineAction(input: unknown) {
  const user = await requireUserContext();
  const result = await deleteMedicine(user, input);
  if (result.ok) refresh();
  return result;
}

export async function createMedicineBatchAction(input: unknown) {
  const user = await requireUserContext();
  const result = await createMedicineBatch(user, input);
  if (result.ok) refresh();
  return result;
}

export async function deleteMedicineBatchAction(input: unknown) {
  const user = await requireUserContext();
  const result = await deleteMedicineBatch(user, input);
  if (result.ok) refresh();
  return result;
}

export async function sellMedicineAction(input: unknown) {
  const user = await requireUserContext();
  const result = await sellMedicine(user, input);
  if (result.ok) refresh();
  return result;
}
