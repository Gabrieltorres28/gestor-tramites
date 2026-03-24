import { ProcedureStatus, ProcedureType } from '@prisma/client';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireUserContext } from '@/lib/auth/session';
import { getProcedures } from '@/lib/data/procedures';
import { createProcedure, deleteProcedure, updateProcedureStatus } from '@/lib/services/procedure.service';
import NewProcedureForm from '@/components/procedures/NewProcedureForm';
import { procedureStatusLabels } from '@/lib/types/app';
import FeedbackBanner from '@/components/FeedbackBanner';
import { formatCurrency } from '@/lib/utils';

export default async function TramitesPage() {
  const user = await requireUserContext();
  const [procedures, clients] = await Promise.all([
    getProcedures(user.businessId),
    db.client.findMany({
      where: { businessId: user.businessId },
      orderBy: { fullName: 'asc' },
      select: { id: true, fullName: true, procedureType: true, commissionRate: true },
    }),
  ]);

  async function createProcedureAction(formData: FormData) {
    'use server';
    const currentUser = await requireUserContext();
    const result = await createProcedure(currentUser, {
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
    if (result.ok) {
      redirect('/tramites?notice=procedure-created');
    }
  }

  async function changeStatusAction(formData: FormData) {
    'use server';
    const currentUser = await requireUserContext();
    const result = await updateProcedureStatus(currentUser, { procedureId: String(formData.get('procedureId') || ''), status: String(formData.get('status') || ProcedureStatus.IN_PROGRESS) });
    revalidatePath('/tramites');
    revalidatePath('/libro-diario');
    revalidatePath('/');
    if (result.ok) {
      redirect('/tramites?notice=procedure-updated');
    }
  }

  async function removeProcedureAction(formData: FormData) {
    'use server';
    const currentUser = await requireUserContext();
    const result = await deleteProcedure(currentUser, { procedureId: String(formData.get('procedureId') || '') });
    revalidatePath('/tramites');
    revalidatePath('/libro-diario');
    revalidatePath('/');
    if (result.ok) {
      redirect('/tramites?notice=procedure-created');
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <FeedbackBanner />
      <section className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/20 sm:p-6"><p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Trámites</p><h1 className="mt-3 text-3xl font-semibold text-white">Seguimiento simple y claro</h1><p className="mt-3 text-sm leading-6 text-slate-300">Creá cada trámite con el cliente correcto y avanzalo con acciones rápidas según el momento de la gestión.</p></div>
        <NewProcedureForm action={createProcedureAction} clients={clients.map((client) => ({ id: client.id, fullName: client.fullName, procedureType: client.procedureType, commissionRate: Number(client.commissionRate) }))} />
      </section>
      <section className="mt-6 space-y-3">{procedures.map((procedure) => <article key={procedure.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/20"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm text-slate-400">{procedure.id}</p><h2 className="mt-1 text-xl font-semibold text-white">{procedure.clientName}</h2><p className="mt-2 text-sm text-slate-300">{procedure.description || 'Sin descripción.'}</p></div><div className="sm:w-56 space-y-2">{procedure.statusKey === 'IN_PROGRESS' ? <form action={changeStatusAction}><input type="hidden" name="procedureId" value={procedure.id} /><input type="hidden" name="status" value={ProcedureStatus.COMPLETED} /><button type="submit" className="w-full rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950">Marcar finalizado</button></form> : null}{procedure.statusKey === 'COMPLETED' ? <><form action={changeStatusAction}><input type="hidden" name="procedureId" value={procedure.id} /><input type="hidden" name="status" value={ProcedureStatus.PAID} /><button type="submit" className="w-full rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950">Marcar cobrado</button></form><form action={changeStatusAction}><input type="hidden" name="procedureId" value={procedure.id} /><input type="hidden" name="status" value={ProcedureStatus.IN_PROGRESS} /><button type="submit" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">Volver a en proceso</button></form></> : null}{procedure.statusKey === 'PAID' ? <form action={changeStatusAction}><input type="hidden" name="procedureId" value={procedure.id} /><input type="hidden" name="status" value={ProcedureStatus.COMPLETED} /><button type="submit" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">Volver a finalizado</button></form> : null}<form action={removeProcedureAction}><input type="hidden" name="procedureId" value={procedure.id} /><button type="submit" className="w-full rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-medium text-rose-200">Borrar trámite</button></form></div></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300 sm:grid-cols-5"><div><p className="text-slate-500">Tipo</p><p className="mt-1">{procedure.type}</p></div><div><p className="text-slate-500">Monto</p><p className="mt-1">{formatCurrency(procedure.amountManaged)}</p></div><div><p className="text-slate-500">Comisión</p><p className="mt-1">{procedure.commissionRate}%</p></div><div><p className="text-slate-500">Generado</p><p className="mt-1">{formatCurrency(procedure.commissionAmount)}</p></div><div><p className="text-slate-500">Inicio</p><p className="mt-1">{procedure.startedAt}</p></div></div></article>)}</section>
    </div>
  );
}
