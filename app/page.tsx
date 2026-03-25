import { UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import FinancialChart from '@/components/FinancialChart';
import MetricCard from '@/components/MetricCard';
import { requireUserContext } from '@/lib/auth/session';
import { getDashboardData } from '@/lib/data/dashboard';
import { updateBusinessSettings } from '@/lib/services/business-settings.service';
import PasswordChangeCard from '@/components/account/PasswordChangeCard';
import SubmitButton from '@/components/ui/SubmitButton';
import { formatCurrency } from '@/lib/utils';
import { procedureTypeLabels } from '@/lib/types/app';

export const dynamic = 'force-dynamic';

function statusTone(status: 'active' | 'expiring' | 'expired' | 'resolved') {
  if (status === 'expired') return 'border-rose-400/20 bg-rose-400/10 text-rose-200';
  if (status === 'expiring') return 'border-amber-400/20 bg-amber-400/10 text-amber-200';
  if (status === 'resolved') return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200';
  return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200';
}

export default async function DashboardPage() {
  const user = await requireUserContext();
  const dashboard = await getDashboardData(user.businessId);

  async function saveSettings(formData: FormData) {
    'use server';
    const currentUser = await requireUserContext();
    await updateBusinessSettings(currentUser, {
      businessName: String(formData.get('businessName') || ''),
      ownerName: String(formData.get('ownerName') || ''),
      defaultCommissionRate: Number(formData.get('defaultCommissionRate') || 0),
    });
    revalidatePath('/');
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/20 sm:p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Vista general</p>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">El estudio se ordena entre trámites, caja y vigencias.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              El tablero resume qué se está cobrando, qué sigue en curso y qué documentación o subsidio necesita seguimiento antes de vencer.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3"><p className="text-slate-400">Clientes</p><p className="mt-1 text-xl font-semibold text-white">{dashboard.metrics.clientsCount}</p></div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3"><p className="text-slate-400">Trámites</p><p className="mt-1 text-xl font-semibold text-white">{dashboard.metrics.proceduresCount}</p></div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard title="Caja actual" value={formatCurrency(dashboard.metrics.cajaActual)} subtitle="Saldo disponible" />
        <MetricCard title="Comisiones" value={formatCurrency(dashboard.metrics.comisiones)} subtitle="Generadas por trámites" />
        <MetricCard title="En proceso" value={String(dashboard.metrics.tramitesActivos)} subtitle="Gestiones abiertas" />
        <MetricCard title="Cobrados" value={String(dashboard.metrics.tramitesCobrados)} subtitle="Impactaron en caja" />
        <MetricCard title="Por vencer" value={String(dashboard.metrics.vigenciasPorVencer)} subtitle="Vigencias activas" />
        <MetricCard title="Vencidas" value={String(dashboard.metrics.vigenciasVencidas)} subtitle="Para revisar" />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <FinancialChart data={dashboard.chartData} title="Panorama del negocio" />
        <div className="space-y-6">
          <form action={saveSettings} className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
            <h2 className="text-xl font-semibold text-white">Datos del estudio</h2>
            <p className="mt-1 text-sm text-slate-400">Actualizá los datos principales del estudio y mantené tu operación alineada.</p>
            <div className="mt-5 space-y-4">
              <label className="block"><span className="mb-2 block text-sm text-slate-300">Nombre del negocio</span><input name="businessName" defaultValue={dashboard.settings.businessName} className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 outline-none focus:border-cyan-400" /></label>
              <label className="block"><span className="mb-2 block text-sm text-slate-300">Responsable</span><input name="ownerName" defaultValue={dashboard.settings.ownerName} className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 outline-none focus:border-cyan-400" /></label>
              <label className="block"><span className="mb-2 block text-sm text-slate-300">Comisión por defecto</span><input type="number" name="defaultCommissionRate" defaultValue={dashboard.settings.defaultCommissionRate} className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 outline-none focus:border-cyan-400" /></label>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-400">{user.role === UserRole.ADMIN ? 'Perfil con permisos para editar esta sección.' : 'Perfil con acceso de consulta.'}</p>
              <SubmitButton pendingText="Guardando cambios..." disabled={user.role === UserRole.OPERATOR} className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">Guardar</SubmitButton>
            </div>
          </form>
          <PasswordChangeCard />
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Vigencias a seguir</h2>
                <p className="mt-1 text-sm text-slate-400">Subsidios, recetas y documentación que piden seguimiento.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Resueltas</p>
                <p className="mt-1 text-xl font-semibold text-white">{dashboard.metrics.vigenciasResueltas}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {dashboard.upcomingAlerts.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/30 p-4 text-sm text-slate-300">
                  Todavía no cargaste vigencias. Podés empezar con recetas, subsidios o documentación a renovar.
                </div>
              ) : (
                dashboard.upcomingAlerts.map((alert) => (
                  <article key={alert.id} className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-400">{alert.clientName} · {procedureTypeLabels[alert.clientProcedureType]}</p>
                        <h3 className="mt-1 text-lg font-semibold text-white">{alert.title}</h3>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusTone(alert.status)}`}>{alert.statusLabel}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-300">
                      <div><p className="text-slate-500">Tipo</p><p className="mt-1">{alert.typeLabel}</p></div>
                      <div><p className="text-slate-500">Vence</p><p className="mt-1">{alert.expiresAt}</p></div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
        <h2 className="text-xl font-semibold text-white">Trámites recientes</h2>
        <div className="mt-5 space-y-3">
          {dashboard.recentTramites.map((tramite) => (
            <article key={tramite.id} className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">{tramite.id}</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">{tramite.clientName}</h3>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">{tramite.type}</span>
                  <span className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs font-medium text-slate-200">{tramite.status}</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
                <div><p className="text-slate-500">Comisión</p><p className="mt-1">{formatCurrency(tramite.commissionAmount)}</p></div>
                <div><p className="text-slate-500">Monto</p><p className="mt-1">{formatCurrency(tramite.amountManaged)}</p></div>
                <div><p className="text-slate-500">Inicio</p><p className="mt-1">{tramite.startedAt}</p></div>
                <div><p className="text-slate-500">Caja</p><p className="mt-1">{tramite.cashRecorded ? 'Registrada' : 'Pendiente'}</p></div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
