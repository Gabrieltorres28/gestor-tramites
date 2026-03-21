import { ProcedureStatus, ProcedureType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireUserContext } from '@/lib/auth/session';
import { getProcedures } from '@/lib/data/procedures';
import { createProcedure, deleteProcedure, updateProcedureStatus } from '@/lib/services/procedure.service';
import { procedureStatusLabels, procedureTypeLabels } from '@/lib/types/app';
import { formatCurrency, todayIso } from '@/lib/utils';

export default async function TramitesPage() {
  const user = await requireUserContext();
  const [procedures, clients] = await Promise.all([
    getProcedures(user.businessId),
    db.client.findMany({ where: { businessId: user.businessId }, orderBy: { fullName: 'asc' } }),
  ]);

  async function createProcedureAction(formData: FormData) {
    'use server';
    const currentUser = await requireUserContext();
    await createProcedure(currentUser, {
      clientId: String(formData.get('clientId') || ''),
      type: String(formData.get('type') || ProcedureType.RETIREMENT),
      status: String(formData.get('status') || ProcedureStatus.IN_PROGRESS),
      amountManaged: Number(formData.get('amountManaged') || 0),
      commissionRate: Number(formData.get('commissionRate') || 0),
      startedAt: String(formData.get('startedAt') || ''),
      description: String(formData.get('description') || ''),
    });
    revalidatePath('/tramites');
    revalidatePath('/libro-diario');
    revalidatePath('/');
  }

  async function changeStatusAction(formData: FormData) {
    'use server';
    const currentUser = await requireUserContext();
    await updateProcedureStatus(currentUser, { procedureId: String(formData.get('procedureId') || ''), status: String(formData.get('status') || ProcedureStatus.IN_PROGRESS) });
    revalidatePath('/tramites');
    revalidatePath('/libro-diario');
    revalidatePath('/');
  }

  async function removeProcedureAction(formData: FormData) {
    'use server';
    const currentUser = await requireUserContext();
    await deleteProcedure(currentUser, { procedureId: String(formData.get('procedureId') || '') });
    revalidatePath('/tramites');
    revalidatePath('/libro-diario');
    revalidatePath('/');
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/20 sm:p-6"><p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Trámites</p><h1 className="mt-3 text-3xl font-semibold text-white">Seguimiento operativo</h1><p className="mt-3 text-sm leading-6 text-slate-300">El estado del trámite y su impacto en caja ya viven del lado servidor.</p></div>
        <form action={createProcedureAction} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
          <h2 className="text-xl font-semibold text-white">Nuevo trámite</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2"><span className="mb-2 block text-sm text-slate-300">Cliente</span><select name="clientId" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400">{clients.map((client) => <option key={client.id} value={client.id} className="bg-slate-900">{client.fullName}</option>)}</select></label>
            <label className="block"><span className="mb-2 block text-sm text-slate-300">Tipo</span><select name="type" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400">{Object.values(ProcedureType).map((type) => <option key={type} value={type} className="bg-slate-900">{procedureTypeLabels[type]}</option>)}</select></label>
            <label className="block"><span className="mb-2 block text-sm text-slate-300">Estado inicial</span><select name="status" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400">{Object.values(ProcedureStatus).map((status) => <option key={status} value={status} className="bg-slate-900">{procedureStatusLabels[status]}</option>)}</select></label>
            <label className="block"><span className="mb-2 block text-sm text-slate-300">Monto</span><input type="number" name="amountManaged" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" /></label>
            <label className="block"><span className="mb-2 block text-sm text-slate-300">Comisión %</span><input type="number" name="commissionRate" defaultValue="15" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" /></label>
            <label className="block sm:col-span-2"><span className="mb-2 block text-sm text-slate-300">Fecha de inicio</span><input type="date" name="startedAt" defaultValue={todayIso()} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" /></label>
            <label className="block sm:col-span-2"><span className="mb-2 block text-sm text-slate-300">Descripción</span><textarea name="description" rows={4} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" /></label>
          </div>
          <button type="submit" className="mt-5 w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">Guardar trámite</button>
        </form>
      </section>
      <section className="mt-6 space-y-3">{procedures.map((procedure) => <article key={procedure.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/20"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm text-slate-400">{procedure.id}</p><h2 className="mt-1 text-xl font-semibold text-white">{procedure.clientName}</h2><p className="mt-2 text-sm text-slate-300">{procedure.description || 'Sin descripción.'}</p></div><div className="sm:w-56 space-y-2"><form action={changeStatusAction}><input type="hidden" name="procedureId" value={procedure.id} /><select name="status" defaultValue={Object.entries(procedureStatusLabels).find(([, value]) => value === procedure.status)?.[0]} className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 outline-none focus:border-cyan-400">{Object.values(ProcedureStatus).map((status) => <option key={status} value={status} className="bg-slate-900">{procedureStatusLabels[status]}</option>)}</select><button type="submit" className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">Actualizar estado</button></form><form action={removeProcedureAction}><input type="hidden" name="procedureId" value={procedure.id} /><button type="submit" className="w-full rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-medium text-rose-200">Borrar trámite</button></form></div></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300 sm:grid-cols-5"><div><p className="text-slate-500">Tipo</p><p className="mt-1">{procedure.type}</p></div><div><p className="text-slate-500">Monto</p><p className="mt-1">{formatCurrency(procedure.amountManaged)}</p></div><div><p className="text-slate-500">Comisión</p><p className="mt-1">{procedure.commissionRate}%</p></div><div><p className="text-slate-500">Generado</p><p className="mt-1">{formatCurrency(procedure.commissionAmount)}</p></div><div><p className="text-slate-500">Inicio</p><p className="mt-1">{procedure.startedAt}</p></div></div></article>)}</section>
    </div>
  );
}
