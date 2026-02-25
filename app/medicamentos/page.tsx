'use client';

import { useState } from 'react';
import { Medicamento, Lote } from '@/types';
import { medicamentosMock, lotesMock } from '@/data/mockData';
import {
  calcularStockTotal,
  encontrarProximoVencimiento,
  obtenerEstadoVencimiento,
  formatearFecha,
  calcularDiasHastaVencimiento,
  procesarVenta,
} from '@/utils/medicamentos';

export default function MedicamentosPage() {
  const [medicamentos] = useState<Medicamento[]>(medicamentosMock);
  const [lotes, setLotes] = useState<Lote[]>(lotesMock);
  const [medicamentoSeleccionado, setMedicamentoSeleccionado] = useState<string | null>(null);
  const [mostrarModalVenta, setMostrarModalVenta] = useState(false);
  const [cantidadVenta, setCantidadVenta] = useState(1);
  const [mensajeVenta, setMensajeVenta] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const abrirModalVenta = (medicamentoId: string) => {
    setMedicamentoSeleccionado(medicamentoId);
    setMostrarModalVenta(true);
    setMensajeVenta(null);
    setCantidadVenta(1);
  };

  const procesarVentaMedicamento = () => {
    if (!medicamentoSeleccionado) return;

    const resultado = procesarVenta(medicamentoSeleccionado, cantidadVenta, lotes);
    
    if (resultado.exito) {
      setLotes(resultado.lotesActualizados);
      setMensajeVenta({ tipo: 'success', texto: resultado.mensaje });
      setTimeout(() => {
        setMostrarModalVenta(false);
        setMensajeVenta(null);
      }, 2000);
    } else {
      setMensajeVenta({ tipo: 'error', texto: resultado.mensaje });
    }
  };

  const getMedicamentoConInfo = (med: Medicamento) => {
    const stockTotal = calcularStockTotal(med.id, lotes);
    const proximoVencimiento = encontrarProximoVencimiento(med.id, lotes);
    const estado = proximoVencimiento ? obtenerEstadoVencimiento(proximoVencimiento) : 'ok';
    const diasRestantes = proximoVencimiento ? calcularDiasHastaVencimiento(proximoVencimiento) : null;

    return {
      ...med,
      stockTotal,
      proximoVencimiento,
      estado,
      diasRestantes,
    };
  };

  const medicamentosConInfo = medicamentos.map(getMedicamentoConInfo);

  // Estadísticas
  const estadisticas = {
    totalMedicamentos: medicamentos.length,
    stockTotal: medicamentosConInfo.reduce((sum, m) => sum + m.stockTotal, 0),
    porVencer: medicamentosConInfo.filter(m => m.estado === 'proximo').length,
    vencidos: medicamentosConInfo.filter(m => m.estado === 'vencido').length,
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'ok':
        return 'bg-green-100 text-green-800';
      case 'proximo':
        return 'bg-yellow-100 text-yellow-800';
      case 'vencido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoTexto = (estado: string, diasRestantes: number | null) => {
    switch (estado) {
      case 'ok':
        return 'OK';
      case 'proximo':
        return `Vence en ${diasRestantes} días`;
      case 'vencido':
        return 'VENCIDO';
      default:
        return 'Sin lotes';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Control de Medicamentos</h1>
        <p className="mt-2 text-sm text-gray-600">
          Gestión de stock, lotes y fechas de vencimiento
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 px-4 py-5">
          <dt className="text-sm font-medium text-gray-500 truncate">
            Total Medicamentos
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {estadisticas.totalMedicamentos}
          </dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 px-4 py-5">
          <dt className="text-sm font-medium text-gray-500 truncate">
            Stock Total
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-primary-600">
            {estadisticas.stockTotal}
          </dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 px-4 py-5">
          <dt className="text-sm font-medium text-gray-500 truncate">
            Por Vencer
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-yellow-600">
            {estadisticas.porVencer}
          </dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 px-4 py-5">
          <dt className="text-sm font-medium text-gray-500 truncate">
            Vencidos
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-red-600">
            {estadisticas.vencidos}
          </dd>
        </div>
      </div>

      {/* Tabla de medicamentos */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Inventario de Medicamentos
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Próximo Vencimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precios
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {medicamentosConInfo.map((medicamento) => (
                <tr key={medicamento.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {medicamento.nombre}
                    </div>
                    <div className="text-xs text-gray-500">{medicamento.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {medicamento.proveedor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {medicamento.stockTotal} unidades
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {medicamento.proximoVencimiento
                      ? formatearFecha(medicamento.proximoVencimiento)
                      : 'Sin lotes'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(
                        medicamento.estado
                      )}`}
                    >
                      {getEstadoTexto(medicamento.estado, medicamento.diasRestantes)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>Compra: ${medicamento.precioCompra}</div>
                    <div className="text-green-600 font-medium">
                      Venta: ${medicamento.precioVenta}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => abrirModalVenta(medicamento.id)}
                      disabled={medicamento.stockTotal === 0}
                      className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md ${
                        medicamento.stockTotal > 0
                          ? 'text-white bg-primary-600 hover:bg-primary-700'
                          : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                      }`}
                    >
                      Vender
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detalle de lotes */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Detalle de Lotes por Medicamento
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número de Lote
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Vencimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Días Restantes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lotes.map((lote) => {
                const medicamento = medicamentos.find(m => m.id === lote.medicamentoId);
                const diasRestantes = calcularDiasHastaVencimiento(lote.fechaVencimiento);
                const estado = obtenerEstadoVencimiento(lote.fechaVencimiento);

                return (
                  <tr key={lote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {medicamento?.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lote.numeroLote}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {lote.cantidadDisponible}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatearFecha(lote.fechaVencimiento)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm font-medium ${
                          diasRestantes < 0
                            ? 'text-red-600'
                            : diasRestantes <= 60
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        {diasRestantes < 0 ? `Vencido hace ${Math.abs(diasRestantes)} días` : `${diasRestantes} días`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(
                          estado
                        )}`}
                      >
                        {estado === 'ok' ? 'OK' : estado === 'proximo' ? 'Por vencer' : 'VENCIDO'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de venta */}
      {mostrarModalVenta && medicamentoSeleccionado && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setMostrarModalVenta(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Procesar Venta
                </h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Medicamento:{' '}
                    <span className="font-medium text-gray-900">
                      {medicamentos.find(m => m.id === medicamentoSeleccionado)?.nombre}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Stock disponible:{' '}
                    <span className="font-medium text-gray-900">
                      {calcularStockTotal(medicamentoSeleccionado, lotes)} unidades
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    La venta se procesa usando FIFO (primero en vencer, primero en salir)
                  </p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad a vender
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cantidadVenta}
                    onChange={(e) => setCantidadVenta(Number(e.target.value))}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                {mensajeVenta && (
                  <div
                    className={`mb-4 p-3 rounded-md ${
                      mensajeVenta.tipo === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    <p className="text-sm">{mensajeVenta.texto}</p>
                  </div>
                )}
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setMostrarModalVenta(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={procesarVentaMedicamento}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                >
                  Confirmar Venta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
