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

export const dynamic = 'force-dynamic';

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
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">El estudio se lee desde el trámite.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Seguimiento, caja y medicamentos quedan alineados para que el tablero muestre lo que realmente está pasando en la operación.
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
        <MetricCard title="Por vencer" value={String(dashboard.metrics.medicamentosPorVencer)} subtitle="Medicamentos" />
        <MetricCard title="Vencidos" value={String(dashboard.metrics.medicamentosVencidos)} subtitle="Para revisar" />
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
