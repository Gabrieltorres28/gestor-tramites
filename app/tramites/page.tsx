import { ProcedureStatus, ProcedureType } from '@prisma/client';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireUserContext } from '@/lib/auth/session';
import { getProcedures } from '@/lib/data/procedures';
import {
  createProcedure,
  deleteProcedure,
  updateProcedure,
  updateProcedureStatus,
} from '@/lib/services/procedure.service';
import NewProcedureForm from '@/components/procedures/NewProcedureForm';
import FeedbackBanner from '@/components/FeedbackBanner';
import SubmitButton from '@/components/ui/SubmitButton';
import DateField from '@/components/ui/DateField';
import { formatCurrency } from '@/lib/utils';
import { procedureTypeDescriptions } from '@/lib/types/app';

function getStatusBadge(status: ProcedureStatus) {
  switch (status) {
    case ProcedureStatus.PAID:
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200';
    case ProcedureStatus.COMPLETED:
      return 'border-amber-400/20 bg-amber-400/10 text-amber-200';
    default:
      return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200';
  }
}

function getTypeBadge(type: ProcedureType) {
  switch (type) {
    case ProcedureType.MEDICINES:
      return 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200';
    case ProcedureType.PENSION:
      return 'border-sky-400/20 bg-sky-400/10 text-sky-200';
    case ProcedureType.SUBSIDY:
      return 'border-violet-400/20 bg-violet-400/10 text-violet-200';
    case ProcedureType.OTHER:
      return 'border-white/10 bg-slate-950/50 text-slate-200';
    default:
      return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200';
  }
}

function getNextStepCopy(status: ProcedureStatus, cashRecorded: boolean) {
  if (status === ProcedureStatus.IN_PROGRESS) {
    return 'Siguiente paso: terminar la gestión cuando ya esté lista para entregar.';
  }

  if (status === ProcedureStatus.COMPLETED) {
    return 'Siguiente paso: marcar como cobrado para registrar la comisión en caja.';
  }

  if (cashRecorded) {
    return 'La comisión ya quedó registrada en caja.';
  }

  return 'El trámite está cobrado, pero todavía no aparece una comisión vinculada en caja.';
}

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

  const inProgressCount = procedures.filter((procedure) => procedure.statusKey === ProcedureStatus.IN_PROGRESS).length;
  const completedCount = procedures.filter((procedure) => procedure.statusKey === ProcedureStatus.COMPLETED).length;
  const paidCount = procedures.filter((procedure) => procedure.statusKey === ProcedureStatus.PAID).length;
  const medicinesCount = procedures.filter((procedure) => procedure.typeKey === ProcedureType.MEDICINES).length;

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

  async function updateProcedureAction(formData: FormData) {
    'use server';
    const currentUser = await requireUserContext();
    const result = await updateProcedure(currentUser, {
      procedureId: String(formData.get('procedureId') || ''),
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
      redirect('/tramites?notice=procedure-edited');
    }
  }

  async function changeStatusAction(formData: FormData) {
    'use server';
    const currentUser = await requireUserContext();
    const result = await updateProcedureStatus(currentUser, {
      procedureId: String(formData.get('procedureId') || ''),
      status: String(formData.get('status') || ProcedureStatus.IN_PROGRESS),
    });
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
    const result = await deleteProcedure(currentUser, {
      procedureId: String(formData.get('procedureId') || ''),
    });
    revalidatePath('/tramites');
    revalidatePath('/libro-diario');
    revalidatePath('/');
    if (result.ok) {
      redirect('/tramites?notice=procedure-deleted');
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <FeedbackBanner />
      <section className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Trámites</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">El trámite es el eje de toda la operación</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Desde acá avanzás la gestión, controlás si ya pasó a caja y mantenés claro qué tipo de servicio se está prestando.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-400">En proceso</p>
              <p className="mt-1 text-2xl font-semibold text-white">{inProgressCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-400">Finalizados</p>
              <p className="mt-1 text-2xl font-semibold text-white">{completedCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-400">Cobrados</p>
              <p className="mt-1 text-2xl font-semibold text-white">{paidCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-400">Medicamentos</p>
              <p className="mt-1 text-2xl font-semibold text-white">{medicinesCount}</p>
            </div>
          </div>
        </div>
        <NewProcedureForm
          action={createProcedureAction}
          clients={clients.map((client) => ({
            id: client.id,
            fullName: client.fullName,
            procedureType: client.procedureType,
            commissionRate: Number(client.commissionRate),
          }))}
        />
      </section>

      <section className="mt-6 space-y-4">
        {procedures.map((procedure) => (
          <article key={procedure.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/20">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getTypeBadge(procedure.typeKey)}`}>
                    {procedure.type}
                  </span>
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadge(procedure.statusKey)}`}>
                    {procedure.status}
                  </span>
                  <span className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs font-medium text-slate-200">
                    {procedure.cashRecorded ? 'Caja vinculada' : 'Caja pendiente'}
                  </span>
                </div>

                <h2 className="mt-4 text-xl font-semibold text-white">{procedure.clientName}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {procedure.description || 'Sin resumen cargado todavía.'}
                </p>
                <p className="mt-3 text-sm text-slate-400">{procedureTypeDescriptions[procedure.typeKey]}</p>
              </div>

              <div className="grid gap-2 xl:w-64">
                {procedure.statusKey === ProcedureStatus.IN_PROGRESS ? (
                  <form action={changeStatusAction}>
                    <input type="hidden" name="procedureId" value={procedure.id} />
                    <input type="hidden" name="status" value={ProcedureStatus.COMPLETED} />
                    <SubmitButton pendingText="Actualizando..." className="w-full rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950">
                      Finalizar trámite
                    </SubmitButton>
                  </form>
                ) : null}

                {procedure.statusKey === ProcedureStatus.COMPLETED ? (
                  <>
                    <form action={changeStatusAction}>
                      <input type="hidden" name="procedureId" value={procedure.id} />
                      <input type="hidden" name="status" value={ProcedureStatus.PAID} />
                      <SubmitButton pendingText="Actualizando..." className="w-full rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950">
                        Marcar cobrado
                      </SubmitButton>
                    </form>
                    <form action={changeStatusAction}>
                      <input type="hidden" name="procedureId" value={procedure.id} />
                      <input type="hidden" name="status" value={ProcedureStatus.IN_PROGRESS} />
                      <SubmitButton pendingText="Actualizando..." className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
                        Volver a en proceso
                      </SubmitButton>
                    </form>
                  </>
                ) : null}

                {procedure.statusKey === ProcedureStatus.PAID ? (
                  <form action={changeStatusAction}>
                    <input type="hidden" name="procedureId" value={procedure.id} />
                    <input type="hidden" name="status" value={ProcedureStatus.COMPLETED} />
                    <SubmitButton pendingText="Actualizando..." className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
                      Volver a finalizado
                    </SubmitButton>
                  </form>
                ) : null}

                <details className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <summary className="cursor-pointer list-none text-sm font-medium text-white">Editar trámite</summary>
                  <form action={updateProcedureAction} className="mt-4 space-y-4">
                    <input type="hidden" name="procedureId" value={procedure.id} />
                    <input type="hidden" name="clientId" value={procedure.clientId} />
                    <input type="hidden" name="type" value={procedure.typeKey} />
                    <input type="hidden" name="status" value={procedure.statusKey} />
                    <label className="block">
                      <span className="mb-2 block text-sm text-slate-300">Monto gestionado</span>
                      <input type="number" name="amountManaged" defaultValue={procedure.amountManaged} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm text-slate-300">Comisión %</span>
                      <input type="number" name="commissionRate" defaultValue={procedure.commissionRate} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
                    </label>
                    <DateField label="Fecha de inicio" name="startedAt" defaultValue={procedure.startedAt.split('/').reverse().join('-')} />
                    <label className="block">
                      <span className="mb-2 block text-sm text-slate-300">Resumen del trámite</span>
                      <textarea name="description" rows={3} defaultValue={procedure.description} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
                    </label>
                    <SubmitButton pendingText="Guardando cambios..." className="w-full rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100">
                      Guardar cambios
                    </SubmitButton>
                  </form>
                </details>

                <form action={removeProcedureAction}>
                  <input type="hidden" name="procedureId" value={procedure.id} />
                  <SubmitButton pendingText="Borrando..." className="w-full rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-medium text-rose-200">
                    Borrar trámite
                  </SubmitButton>
                </form>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-300 sm:grid-cols-3 xl:grid-cols-6">
              <div>
                <p className="text-slate-500">Monto</p>
                <p className="mt-1">{formatCurrency(procedure.amountManaged)}</p>
              </div>
              <div>
                <p className="text-slate-500">Comisión</p>
                <p className="mt-1">{procedure.commissionRate}%</p>
              </div>
              <div>
                <p className="text-slate-500">Generado</p>
                <p className="mt-1">{formatCurrency(procedure.commissionAmount)}</p>
              </div>
              <div>
                <p className="text-slate-500">Inicio</p>
                <p className="mt-1">{procedure.startedAt}</p>
              </div>
              <div>
                <p className="text-slate-500">Finalización</p>
                <p className="mt-1">{procedure.completedAt || 'Pendiente'}</p>
              </div>
              <div>
                <p className="text-slate-500">Caja</p>
                <p className="mt-1">{procedure.cashRecorded ? 'Comisión registrada' : 'Aún no registrada'}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
              {getNextStepCopy(procedure.statusKey, procedure.cashRecorded)}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
