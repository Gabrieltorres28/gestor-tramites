'use client';

import { useState, useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import FinancialChart from '@/components/FinancialChart';
import { tramitesMock, movimientosMock, lotesMock } from '@/data/mockData';
import { DashboardMetrics } from '@/types';
import {
  contarMedicamentosPorVencer,
  contarMedicamentosVencidos,
  generarDatosGraficoFinanciero,
} from '@/utils/medicamentos';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    cajaActual: 0,
    comisionesMes: 0,
    tramitesActivos: 0,
    gananciaMensual: 0,
    medicamentosPorVencer: 0,
    medicamentosVencidos: 0,
  });

  useEffect(() => {
    // Calcular métricas
    const tramitesActivos = tramitesMock.filter(
      (t) => t.estado === 'En proceso'
    ).length;

    const comisionesMes = tramitesMock
      .filter((t) => t.estado === 'Cobrado' || t.estado === 'Finalizado')
      .reduce((sum, t) => sum + t.comisionCalculada, 0);

    const cajaActual = movimientosMock.reduce((sum, m) => sum + m.monto, 0);

    const gananciaMensual = movimientosMock
      .filter((m) => m.tipo === 'Ingreso comisión')
      .reduce((sum, m) => sum + m.monto, 0);

    const medicamentosPorVencer = contarMedicamentosPorVencer(lotesMock);
    const medicamentosVencidos = contarMedicamentosVencidos(lotesMock);

    setMetrics({
      cajaActual,
      comisionesMes,
      tramitesActivos,
      gananciaMensual,
      medicamentosPorVencer,
      medicamentosVencidos,
    });
  }, []);

  const chartData = generarDatosGraficoFinanciero(movimientosMock);

  const recentTramites = tramitesMock.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Resumen de tu gestión administrativa
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <MetricCard
          title="Caja Actual"
          value={`$${metrics.cajaActual.toLocaleString('es-AR')}`}
          subtitle="Saldo disponible"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <MetricCard
          title="Comisiones del Mes"
          value={`$${metrics.comisionesMes.toLocaleString('es-AR')}`}
          subtitle="Total devengado"
          trend={{ value: '+12.5%', isPositive: true }}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          }
        />
        <MetricCard
          title="Trámites Activos"
          value={metrics.tramitesActivos.toString()}
          subtitle="En gestión"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <MetricCard
          title="Ganancia Mensual"
          value={`$${metrics.gananciaMensual.toLocaleString('es-AR')}`}
          subtitle="Comisiones cobradas"
          trend={{ value: '+8.2%', isPositive: true }}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <MetricCard
          title="Medicamentos por Vencer"
          value={metrics.medicamentosPorVencer.toString()}
          subtitle="Vencen en 60 días"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <MetricCard
          title="Medicamentos Vencidos"
          value={metrics.medicamentosVencidos.toString()}
          subtitle="Requieren atención"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Gráfico de comisiones */}
      <div className="mb-8">
        <FinancialChart
          data={chartData}
          title="Análisis Financiero Mensual"
        />
      </div>

      {/* Trámites recientes */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Trámites Recientes
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comisión
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTramites.map((tramite) => (
                <tr key={tramite.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tramite.clienteNombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tramite.tipo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${tramite.montoGestionado.toLocaleString('es-AR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ${tramite.comisionCalculada.toLocaleString('es-AR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        tramite.estado === 'Cobrado'
                          ? 'bg-green-100 text-green-800'
                          : tramite.estado === 'Finalizado'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {tramite.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
