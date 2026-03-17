'use client';

import { useState } from 'react';
import MetricCard from '@/components/MetricCard';
import FinancialChart from '@/components/FinancialChart';
import { useAppData } from '@/components/AppProvider';
import {
  contarMedicamentosPorVencer,
  contarMedicamentosVencidos,
  generarDatosGraficoFinanciero,
} from '@/utils/medicamentos';

export default function DashboardPage() {
  const { data, updateSettings } = useAppData();
  const [settingsForm, setSettingsForm] = useState(data.settings);
  const [saveMessage, setSaveMessage] = useState('');

  const tramitesActivos = data.tramites.filter((tramite) => tramite.estado === 'En proceso').length;
  const comisionesMes = data.tramites
    .filter((tramite) => tramite.estado === 'Cobrado' || tramite.estado === 'Finalizado')
    .reduce((sum, tramite) => sum + tramite.comisionCalculada, 0);
  const cajaActual = data.movimientos.reduce((sum, movimiento) => sum + movimiento.monto, 0);
  const gananciaMensual = data.movimientos
    .filter((movimiento) => movimiento.tipo === 'Ingreso comisión')
    .reduce((sum, movimiento) => sum + movimiento.monto, 0);
  const medicamentosPorVencer = contarMedicamentosPorVencer(data.lotes);
  const medicamentosVencidos = contarMedicamentosVencidos(data.lotes);
  const chartData = generarDatosGraficoFinanciero(data.movimientos);
  const recentTramites = [...data.tramites].slice(0, 4);

  const handleSaveSettings = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateSettings(settingsForm);
    setSaveMessage('Configuración guardada.');
    window.setTimeout(() => setSaveMessage(''), 2200);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/20 sm:p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Resumen general</p>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Gestión previsional lista para operar desde el celular.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Cargá clientes, abrí trámites, registrá movimientos y dejá el acceso listo para entregar con un solo link.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
              <p className="text-slate-400">Clientes</p>
              <p className="mt-1 text-xl font-semibold text-white">{data.clientes.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
              <p className="text-slate-400">Trámites</p>
              <p className="mt-1 text-xl font-semibold text-white">{data.tramites.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard title="Caja actual" value={'$' + cajaActual.toLocaleString('es-AR')} subtitle="Saldo disponible" />
        <MetricCard title="Comisiones" value={'$' + comisionesMes.toLocaleString('es-AR')} subtitle="Total generado" />
        <MetricCard title="Trámites activos" value={String(tramitesActivos)} subtitle="En curso" />
        <MetricCard title="Ganancia mensual" value={'$' + gananciaMensual.toLocaleString('es-AR')} subtitle="Cobrado" />
        <MetricCard title="Por vencer" value={String(medicamentosPorVencer)} subtitle="Medicamentos" />
        <MetricCard title="Vencidos" value={String(medicamentosVencidos)} subtitle="Requieren control" />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <FinancialChart data={chartData} title="Rendimiento financiero" />

        <form onSubmit={handleSaveSettings} className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Acceso y datos del estudio</h2>
              <p className="mt-1 text-sm text-slate-400">Editá nombre comercial y credenciales del login.</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Nombre del negocio</span>
              <input
                value={settingsForm.businessName}
                onChange={(event) => setSettingsForm({ ...settingsForm, businessName: event.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 outline-none focus:border-cyan-400"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Responsable</span>
              <input
                value={settingsForm.ownerName}
                onChange={(event) => setSettingsForm({ ...settingsForm, ownerName: event.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 outline-none focus:border-cyan-400"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Email de acceso</span>
              <input
                type="email"
                value={settingsForm.loginEmail}
                onChange={(event) => setSettingsForm({ ...settingsForm, loginEmail: event.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 outline-none focus:border-cyan-400"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Contraseña</span>
              <input
                type="text"
                value={settingsForm.loginPassword}
                onChange={(event) => setSettingsForm({ ...settingsForm, loginPassword: event.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 outline-none focus:border-cyan-400"
              />
            </label>
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-sm text-emerald-300">{saveMessage}</p>
            <button type="submit" className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
              Guardar acceso
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Trámites recientes</h2>
            <p className="mt-1 text-sm text-slate-400">Vista rápida optimizada para mobile.</p>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {recentTramites.map((tramite) => (
            <article key={tramite.id} className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">{tramite.id}</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">{tramite.clienteNombre}</h3>
                </div>
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                  {tramite.estado}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
                <div>
                  <p className="text-slate-500">Tipo</p>
                  <p className="mt-1">{tramite.tipo}</p>
                </div>
                <div>
                  <p className="text-slate-500">Comisión</p>
                  <p className="mt-1">{'$' + tramite.comisionCalculada.toLocaleString('es-AR')}</p>
                </div>
                <div>
                  <p className="text-slate-500">Monto</p>
                  <p className="mt-1">{'$' + tramite.montoGestionado.toLocaleString('es-AR')}</p>
                </div>
                <div>
                  <p className="text-slate-500">Inicio</p>
                  <p className="mt-1">{tramite.fechaInicio}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
