'use client';

import { useState, useEffect } from 'react';
import { Movimiento, TipoMovimiento } from '@/types';
import { movimientosMock } from '@/data/mockData';

export default function LibroDiarioPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>(movimientosMock);
  const [filtroTipo, setFiltroTipo] = useState<TipoMovimiento | 'Todos'>('Todos');
  const [saldo, setSaldo] = useState(0);

  useEffect(() => {
    const saldoCalculado = movimientos.reduce((sum, m) => sum + m.monto, 0);
    setSaldo(saldoCalculado);
  }, [movimientos]);

  const movimientosFiltrados =
    filtroTipo === 'Todos'
      ? movimientos
      : movimientos.filter((m) => m.tipo === filtroTipo);

  const estadisticas = {
    ingresos: movimientos
      .filter((m) => m.monto > 0)
      .reduce((sum, m) => sum + m.monto, 0),
    egresos: movimientos
      .filter((m) => m.monto < 0)
      .reduce((sum, m) => sum + Math.abs(m.monto), 0),
    comisiones: movimientos
      .filter((m) => m.tipo === 'Ingreso comisión')
      .reduce((sum, m) => sum + m.monto, 0),
  };

  // Ordenar por fecha descendente
  const movimientesOrdenados = [...movimientosFiltrados].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Libro Diario</h1>
        <p className="mt-2 text-sm text-gray-600">
          Registro completo de movimientos financieros
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 px-4 py-5">
          <dt className="text-sm font-medium text-gray-500 truncate">
            Saldo Actual
          </dt>
          <dd
            className={`mt-1 text-3xl font-semibold ${
              saldo >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            ${saldo.toLocaleString('es-AR')}
          </dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 px-4 py-5">
          <dt className="text-sm font-medium text-gray-500 truncate">
            Total Ingresos
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-green-600">
            ${estadisticas.ingresos.toLocaleString('es-AR')}
          </dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 px-4 py-5">
          <dt className="text-sm font-medium text-gray-500 truncate">
            Total Egresos
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-red-600">
            ${estadisticas.egresos.toLocaleString('es-AR')}
          </dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 px-4 py-5">
          <dt className="text-sm font-medium text-gray-500 truncate">
            Comisiones Cobradas
          </dt>
          <dd className="mt-1 text-2xl font-semibold text-primary-600">
            ${estadisticas.comisiones.toLocaleString('es-AR')}
          </dd>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por tipo de movimiento
            </label>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(
            [
              'Todos',
              'Ingreso comisión',
              'Ingreso cliente',
              'Egreso',
              'Gasto',
            ] as const
          ).map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filtroTipo === tipo
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {tipo}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de movimientos */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medio de Pago
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movimientesOrdenados.map((movimiento, index) => {
                const saldoParcial = movimientos
                  .filter((m) => {
                    const fechaM = new Date(m.fecha);
                    const fechaMov = new Date(movimiento.fecha);
                    return (
                      fechaM < fechaMov ||
                      (fechaM.getTime() === fechaMov.getTime() &&
                        movimientos.indexOf(m) <= movimientos.indexOf(movimiento))
                    );
                  })
                  .reduce((sum, m) => sum + m.monto, 0);

                return (
                  <tr key={movimiento.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatearFecha(movimiento.fecha)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          movimiento.tipo === 'Ingreso comisión'
                            ? 'bg-green-100 text-green-800'
                            : movimiento.tipo === 'Ingreso cliente'
                            ? 'bg-blue-100 text-blue-800'
                            : movimiento.tipo === 'Egreso'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {movimiento.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>{movimiento.descripcion}</div>
                      {movimiento.tramiteId && (
                        <div className="text-xs text-gray-500 mt-1">
                          Ref: {movimiento.tramiteId}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movimiento.medioPago}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div
                        className={`text-sm font-semibold ${
                          movimiento.monto >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {movimiento.monto >= 0 ? '+' : ''}$
                        {Math.abs(movimiento.monto).toLocaleString('es-AR')}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Saldo: ${saldoParcial.toLocaleString('es-AR')}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {movimientesOrdenados.length === 0 && (
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay movimientos
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron movimientos con el filtro seleccionado
          </p>
        </div>
      )}
    </div>
  );
}
