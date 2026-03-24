import { CashMovementType, PaymentMethod } from '@prisma/client';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireUserContext } from '@/lib/auth/session';
import { getCashMovements } from '@/lib/data/cash';
import { createCashMovement, deleteCashMovement } from '@/lib/services/cash.service';
import FeedbackBanner from '@/components/FeedbackBanner';
import SubmitButton from '@/components/ui/SubmitButton';
import DateField from '@/components/ui/DateField';
import { cashMovementTypeLabels, paymentMethodLabels } from '@/lib/types/app';
import { formatCurrency, todayIso } from '@/lib/utils';

export default async function LibroDiarioPage() {
  const user = await requireUserContext();
  const movements = await getCashMovements(user.businessId);
  const saldo = movements.reduce((sum, movement) => sum + movement.amount, 0);
  const ingresos = movements.filter((movement) => movement.amount > 0).reduce((sum, movement) => sum + movement.amount, 0);
  const egresos = movements.filter((movement) => movement.amount < 0).reduce((sum, movement) => sum + Math.abs(movement.amount), 0);

  async function createMovementAction(formData: FormData) {
    'use server';
    const currentUser = await requireUserContext();
    const result = await createCashMovement(currentUser, { type: String(formData.get('type') || CashMovementType.CLIENT_INCOME), paymentMethod: String(formData.get('paymentMethod') || PaymentMethod.BANK_TRANSFER), description: String(formData.get('description') || ''), amount: Number(formData.get('amount') || 0), movementDate: String(formData.get('movementDate') || '') });
    revalidatePath('/libro-diario');
    revalidatePath('/');
    if (result.ok) {
      redirect('/libro-diario?notice=cash-created');
    }
  }

  async function removeMovementAction(formData: FormData) {
    'use server';
    const currentUser = await requireUserContext();
    const result = await deleteCashMovement(currentUser, { movementId: String(formData.get('movementId') || '') });
    revalidatePath('/libro-diario');
    revalidatePath('/');
    if (result.ok) {
      redirect('/libro-diario?notice=cash-deleted');
    }
  }

  return <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8"><FeedbackBanner /><section className="grid gap-6 xl:grid-cols-[1fr_0.92fr]"><div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/20 sm:p-6"><p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Libro diario</p><h1 className="mt-3 text-3xl font-semibold text-white">Caja y movimientos</h1><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"><p className="text-sm text-slate-400">Saldo</p><p className="mt-1 text-xl font-semibold text-white">{formatCurrency(saldo)}</p></div><div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"><p className="text-sm text-slate-400">Ingresos</p><p className="mt-1 text-xl font-semibold text-white">{formatCurrency(ingresos)}</p></div><div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"><p className="text-sm text-slate-400">Egresos</p><p className="mt-1 text-xl font-semibold text-white">{formatCurrency(egresos)}</p></div><div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"><p className="text-sm text-slate-400">Comisiones</p><p className="mt-1 text-xl font-semibold text-white">{formatCurrency(movements.filter((movement) => movement.type === 'Ingreso comisión').reduce((sum, movement) => sum + movement.amount, 0))}</p></div></div></div><form action={createMovementAction} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20 sm:p-6"><h2 className="text-xl font-semibold text-white">Nuevo movimiento</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><DateField label="Fecha" name="movementDate" defaultValue={todayIso()} /><label className="block"><span className="mb-2 block text-sm text-slate-300">Tipo</span><select name="type" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400">{Object.values(CashMovementType).map((type) => <option key={type} value={type} className="bg-slate-900">{cashMovementTypeLabels[type]}</option>)}</select></label><label className="block"><span className="mb-2 block text-sm text-slate-300">Monto</span><input type="number" name="amount" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" /></label><label className="block"><span className="mb-2 block text-sm text-slate-300">Medio de pago</span><select name="paymentMethod" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400">{Object.values(PaymentMethod).map((method) => <option key={method} value={method} className="bg-slate-900">{paymentMethodLabels[method]}</option>)}</select></label><label className="block sm:col-span-2"><span className="mb-2 block text-sm text-slate-300">Descripción</span><textarea name="description" rows={4} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" /></label></div><SubmitButton pendingText="Guardando movimiento..." className="mt-5 w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">Guardar movimiento</SubmitButton></form></section><section className="mt-6 space-y-3">{movements.map((movement) => <article key={movement.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/20"><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-slate-400">{movement.movementDate}</p><h2 className="mt-1 text-lg font-semibold text-white">{movement.description}</h2></div><div className="flex items-center gap-2"><span className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs font-medium text-slate-200">{movement.type}</span><form action={removeMovementAction}><input type="hidden" name="movementId" value={movement.id} /><SubmitButton pendingText="Borrando..." className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs font-medium text-rose-200">Borrar</SubmitButton></form></div></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300 sm:grid-cols-4"><div><p className="text-slate-500">Medio</p><p className="mt-1">{movement.paymentMethod}</p></div><div><p className="text-slate-500">Monto</p><p className="mt-1">{formatCurrency(movement.amount)}</p></div><div><p className="text-slate-500">Referencia</p><p className="mt-1">{movement.procedureId || 'Manual'}</p></div><div><p className="text-slate-500">Impacto</p><p className="mt-1">{movement.amount >= 0 ? 'Ingreso' : 'Salida'}</p></div></div></article>)}</section></div>;
}
