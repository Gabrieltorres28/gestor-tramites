'use client';

import { useState } from 'react';
import { Tramite, EstadoTramite } from '@/types';
import { tramitesMock } from '@/data/mockData';

export default function TramitesPage() {
  const [tramites, setTramites] = useState<Tramite[]>(tramitesMock);
  const [filtroEstado, setFiltroEstado] = useState<EstadoTramite | 'Todos'>(
    'Todos'
  );

  const cambiarEstado = (id: string, nuevoEstado: EstadoTramite) => {
    setTramites(
      tramites.map((t) =>
        t.id === id
          ? {
              ...t,
              estado: nuevoEstado,
              fechaFin:
                nuevoEstado === 'Finalizado' || nuevoEstado === 'Cobrado'
                  ? new Date().toISOString().split('T')[0]
                  : t.fechaFin,
            }
          : t
      )
    );
  };

  const tramitesFiltrados =
    filtroEstado === 'Todos'
      ? tramites
      : tramites.filter((t) => t.estado === filtroEstado);

  const estadisticas = {
    enProceso: tramites.filter((t) => t.estado === 'En proceso').length,
    finalizados: tramites.filter((t) => t.estado === 'Finalizado').length,
    cobrados: tramites.filter((t) => t.estado === 'Cobrado').length,
    totalComisiones: tramites.reduce((sum, t) => sum + t.comisionCalculada, 0),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Trámites</h1>
        <p className="mt-2 text-sm text-gray-600">
          Gestiona todos los trámites en proceso
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 px-4 py-5">
          <dt className="text-sm font-medium text-gray-500 truncate">
            En Proceso
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-yellow-600">
            {estadisticas.enProceso}
          </dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 px-4 py-5">
          <dt className="text-sm font-medium text-gray-500 truncate">
            Finalizados
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-blue-600">
            {estadisticas.finalizados}
          </dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 px-4 py-5">
          <dt className="text-sm font-medium text-gray-500 truncate">Cobrados</dt>
          <dd className="mt-1 text-3xl font-semibold text-green-600">
            {estadisticas.cobrados}
          </dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 px-4 py-5">
          <dt className="text-sm font-medium text-gray-500 truncate">
            Total Comisiones
          </dt>
          <dd className="mt-1 text-2xl font-semibold text-gray-900">
            ${estadisticas.totalComisiones.toLocaleString('es-AR')}
          </dd>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por estado
            </label>
          </div>
        </div>
        <div className="flex gap-2">
          {(['Todos', 'En proceso', 'Finalizado', 'Cobrado'] as const).map(
            (estado) => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filtroEstado === estado
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {estado}
              </button>
            )
          )}
        </div>
      </div>

      {/* Tabla de trámites */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto Gestionado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % Comisión
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comisión
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tramitesFiltrados.map((tramite) => (
                <tr key={tramite.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tramite.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {tramite.clienteNombre}
                    </div>
                    <div className="text-xs text-gray-500">
                      Inicio: {tramite.fechaInicio}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tramite.tipo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${tramite.montoGestionado.toLocaleString('es-AR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary-600">
                    {tramite.porcentajeComision}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">
                      ${tramite.comisionCalculada.toLocaleString('es-AR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      Calculado automáticamente
                    </div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select
                      value={tramite.estado}
                      onChange={(e) =>
                        cambiarEstado(tramite.id, e.target.value as EstadoTramite)
                      }
                      className="block w-full border-gray-300 rounded-md shadow-sm text-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="En proceso">En proceso</option>
                      <option value="Finalizado">Finalizado</option>
                      <option value="Cobrado">Cobrado</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {tramitesFiltrados.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 mt-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay trámites
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron trámites con el filtro seleccionado
          </p>
        </div>
      )}
    </div>
  );
}
