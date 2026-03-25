import { ClientAlertType } from '@prisma/client';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireUserContext } from '@/lib/auth/session';
import { getClientAlerts, getSuggestedAlertTitle } from '@/lib/data/client-alerts';
import { getClients } from '@/lib/data/clients';
import { createClientAlert, deleteClientAlert, toggleClientAlertResolved } from '@/lib/services/client-alert.service';
import FeedbackBanner from '@/components/FeedbackBanner';
import SubmitButton from '@/components/ui/SubmitButton';
import DateField from '@/components/ui/DateField';
import { clientAlertTypeLabels, procedureTypeLabels } from '@/lib/types/app';
import { todayIso } from '@/lib/utils';

function toneClasses(status: 'active' | 'expiring' | 'expired' | 'resolved') {
  if (status === 'expired') return 'border-rose-400/20 bg-rose-400/10 text-rose-200';
  if (status === 'expiring') return 'border-amber-400/20 bg-amber-400/10 text-amber-200';
  if (status === 'resolved') return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200';
  return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200';
}

function toErrorRedirect(message: string) {
  return `/vigencias?error=${encodeURIComponent(message)}`;
}

function rethrowIfRedirectError(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    typeof (error as { digest?: string }).digest === 'string' &&
    (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')
  ) {
    throw error;
  }
}

export default async function VigenciasPage() {
  const user = await requireUserContext();
  const [alerts, clients] = await Promise.all([
    getClientAlerts(user.businessId),
    getClients(user.businessId),
  ]);

  const activeCount = alerts.filter((alert) => alert.status === 'active').length;
  const expiringCount = alerts.filter((alert) => alert.status === 'expiring').length;
  const expiredCount = alerts.filter((alert) => alert.status === 'expired').length;
  const resolvedCount = alerts.filter((alert) => alert.status === 'resolved').length;

  async function createAlertAction(formData: FormData) {
    'use server';

    try {
      const currentUser = await requireUserContext();
      const result = await createClientAlert(currentUser, {
        clientId: String(formData.get('clientId') || ''),
        type: String(formData.get('type') || ClientAlertType.OTHER),
        title: String(formData.get('title') || ''),
        notes: String(formData.get('notes') || ''),
        startsAt: String(formData.get('startsAt') || ''),
        expiresAt: String(formData.get('expiresAt') || ''),
      });

      revalidatePath('/vigencias');
      revalidatePath('/clientes');
      revalidatePath('/');

      if (result.ok) {
        redirect('/vigencias?notice=alert-created');
      }

      redirect(toErrorRedirect(result.message || 'No pudimos guardar la vigencia.'));
    } catch (error) {
      rethrowIfRedirectError(error);
      console.error('[vigencias] createAlertAction failed', error);
      redirect(toErrorRedirect('No pudimos guardar la vigencia. Revisá los datos e intentá de nuevo.'));
    }
  }

  async function toggleResolvedAction(formData: FormData) {
    'use server';

    try {
      const currentUser = await requireUserContext();
      const result = await toggleClientAlertResolved(currentUser, {
        clientAlertId: String(formData.get('clientAlertId') || ''),
      });

      revalidatePath('/vigencias');
      revalidatePath('/clientes');
      revalidatePath('/');

      if (result.ok) {
        redirect('/vigencias?notice=alert-updated');
      }

      redirect(toErrorRedirect(result.message || 'No pudimos actualizar la vigencia.'));
    } catch (error) {
      rethrowIfRedirectError(error);
      console.error('[vigencias] toggleResolvedAction failed', error);
      redirect(toErrorRedirect('No pudimos actualizar la vigencia.'));
    }
  }

  async function deleteAlertAction(formData: FormData) {
    'use server';

    try {
      const currentUser = await requireUserContext();
      const result = await deleteClientAlert(currentUser, {
        clientAlertId: String(formData.get('clientAlertId') || ''),
      });

      revalidatePath('/vigencias');
      revalidatePath('/clientes');
      revalidatePath('/');

      if (result.ok) {
        redirect('/vigencias?notice=alert-deleted');
      }

      redirect(toErrorRedirect(result.message || 'No pudimos borrar la vigencia.'));
    } catch (error) {
      rethrowIfRedirectError(error);
      console.error('[vigencias] deleteAlertAction failed', error);
      redirect(toErrorRedirect('No pudimos borrar la vigencia.'));
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <FeedbackBanner />
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Vigencias</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Seguimiento claro de subsidios, recetas y documentación</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Este módulo concentra todo lo que vence. Ya no queda escondido en notas ni mezclado con stock: cada cliente tiene su seguimiento visible y conectado al panel.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"><p className="text-sm text-slate-400">Vigentes</p><p className="mt-1 text-2xl font-semibold text-white">{activeCount}</p></div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"><p className="text-sm text-slate-400">Por vencer</p><p className="mt-1 text-2xl font-semibold text-white">{expiringCount}</p></div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"><p className="text-sm text-slate-400">Vencidas</p><p className="mt-1 text-2xl font-semibold text-white">{expiredCount}</p></div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"><p className="text-sm text-slate-400">Resueltas</p><p className="mt-1 text-2xl font-semibold text-white">{resolvedCount}</p></div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-5 text-sm leading-6 text-slate-300 shadow-lg shadow-slate-950/20">
              Todavía no cargaste vigencias. Podés empezar con algo como <span className="font-semibold text-white">Subsidio social</span>, <span className="font-semibold text-white">Receta vigente</span> o <span className="font-semibold text-white">Documento a renovar</span>.
            </div>
          ) : (
            alerts.map((alert) => (
              <article key={alert.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/20">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-400">{alert.clientName} · {procedureTypeLabels[alert.clientProcedureType]}</p>
                    <h2 className="mt-1 text-xl font-semibold text-white">{alert.title}</h2>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${toneClasses(alert.status)}`}>{alert.statusLabel}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs font-medium text-slate-200">{alert.typeLabel}</span>
                  {alert.daysRemaining !== null ? (
                    <span className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs font-medium text-slate-200">
                      {alert.daysRemaining >= 0
                        ? `${alert.daysRemaining} día${alert.daysRemaining === 1 ? '' : 's'} restantes`
                        : `${Math.abs(alert.daysRemaining)} día${Math.abs(alert.daysRemaining) === 1 ? '' : 's'} vencida`}
                    </span>
                  ) : null}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300 sm:grid-cols-4">
                  <div><p className="text-slate-500">Inicio</p><p className="mt-1">{alert.startsAt || 'Sin dato'}</p></div>
                  <div><p className="text-slate-500">Vence</p><p className="mt-1">{alert.expiresAt}</p></div>
                  <div><p className="text-slate-500">Estado</p><p className="mt-1">{alert.statusLabel}</p></div>
                  <div><p className="text-slate-500">Creada</p><p className="mt-1">{alert.createdAt}</p></div>
                </div>
                <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
                  <p><span className="text-slate-500">Detalle:</span> {alert.notes || 'Sin observaciones.'}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={toggleResolvedAction}>
                    <input type="hidden" name="clientAlertId" value={alert.id} />
                    <SubmitButton pendingText="Guardando..." className="rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                      {alert.status === 'resolved' ? 'Reabrir' : 'Marcar resuelta'}
                    </SubmitButton>
                  </form>
                  <form action={deleteAlertAction}>
                    <input type="hidden" name="clientAlertId" value={alert.id} />
                    <SubmitButton pendingText="Borrando..." className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-medium text-rose-200">Eliminar</SubmitButton>
                  </form>
                </div>
              </article>
            ))
          )}
        </div>

        <form action={createAlertAction} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
          <h2 className="text-xl font-semibold text-white">Nueva vigencia</h2>
          <p className="mt-1 text-sm text-slate-400">Cargá el vencimiento una sola vez y el sistema lo sigue desde clientes y dashboard.</p>
          <div className="mt-5 grid gap-4">
            <label className="block"><span className="mb-2 block text-sm text-slate-300">Cliente</span><select name="clientId" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400">{clients.map((client) => <option key={client.id} value={client.id} className="bg-slate-900">{client.fullName}</option>)}</select></label>
            <label className="block"><span className="mb-2 block text-sm text-slate-300">Tipo</span><select name="type" defaultValue={ClientAlertType.SUBSIDY} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400">{Object.values(ClientAlertType).map((type) => <option key={type} value={type} className="bg-slate-900">{clientAlertTypeLabels[type]}</option>)}</select></label>
            <label className="block"><span className="mb-2 block text-sm text-slate-300">Título</span><input name="title" defaultValue={getSuggestedAlertTitle(ClientAlertType.SUBSIDY)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <DateField label="Desde" name="startsAt" defaultValue={todayIso()} />
              <DateField label="Vence" name="expiresAt" defaultValue={todayIso()} />
            </div>
            <label className="block"><span className="mb-2 block text-sm text-slate-300">Detalle</span><textarea name="notes" rows={4} placeholder="Ejemplo: Subsidio social vence y hay que renovar la documentación." className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" /></label>
          </div>
          <SubmitButton pendingText="Guardando vigencia..." className="mt-5 w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">Guardar vigencia</SubmitButton>
        </form>
      </section>
    </div>
  );
}
