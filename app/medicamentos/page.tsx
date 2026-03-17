'use client';

import { useState } from 'react';
import { useAppData } from '@/components/AppProvider';
import {
  calcularStockTotal,
  encontrarProximoVencimiento,
  obtenerEstadoVencimiento,
  formatearFecha,
  calcularDiasHastaVencimiento,
  procesarVenta,
} from '@/utils/medicamentos';

export default function MedicamentosPage() {
  const { data, addMedicamento, deleteMedicamento, addLote, deleteLote, updateLotes } = useAppData();
  const [medicamentoSeleccionado, setMedicamentoSeleccionado] = useState<string | null>(null);
  const [cantidadVenta, setCantidadVenta] = useState(1);
  const [mensajeVenta, setMensajeVenta] = useState('');
  const [medForm, setMedForm] = useState({
    nombre: '',
    proveedor: '',
    precioCompra: 0,
    precioVenta: 0,
  });
  const [loteForm, setLoteForm] = useState({
    medicamentoId: '',
    numeroLote: '',
    fechaVencimiento: '',
    cantidadDisponible: 0,
  });

  const medicamentosConInfo = data.medicamentos.map((medicamento) => {
    const stockTotal = calcularStockTotal(medicamento.id, data.lotes);
    const proximoVencimiento = encontrarProximoVencimiento(medicamento.id, data.lotes);
    const estado = proximoVencimiento ? obtenerEstadoVencimiento(proximoVencimiento) : 'ok';
    const diasRestantes = proximoVencimiento ? calcularDiasHastaVencimiento(proximoVencimiento) : null;

    return {
      ...medicamento,
      stockTotal,
      proximoVencimiento,
      estado,
      diasRestantes,
    };
  });

  const procesarVentaMedicamento = () => {
    if (!medicamentoSeleccionado || cantidadVenta <= 0) {
      return;
    }

    const resultado = procesarVenta(medicamentoSeleccionado, cantidadVenta, data.lotes);
    setMensajeVenta(resultado.mensaje);

    if (resultado.exito) {
      updateLotes(resultado.lotesActualizados);
      window.setTimeout(() => {
        setMedicamentoSeleccionado(null);
        setCantidadVenta(1);
        setMensajeVenta('');
      }, 1800);
    }
  };

  const handleAddMedicamento = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!medForm.nombre.trim() || medForm.precioVenta < 0 || medForm.precioCompra < 0) {
      return;
    }

    const nuevo = addMedicamento(medForm);
    setMedForm({
      nombre: '',
      proveedor: '',
      precioCompra: 0,
      precioVenta: 0,
    });
    setLoteForm((current) => ({ ...current, medicamentoId: nuevo.id }));
  };

  const handleAddLote = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!loteForm.medicamentoId || !loteForm.numeroLote.trim() || !loteForm.fechaVencimiento || loteForm.cantidadDisponible <= 0) {
      return;
    }

    addLote(loteForm);
    setLoteForm({
      medicamentoId: loteForm.medicamentoId,
      numeroLote: '',
      fechaVencimiento: '',
      cantidadDisponible: 0,
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Medicamentos</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Stock y vencimientos</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Ahora podés cargar medicamentos, agregar lotes, descontar ventas y borrar registros desde el mismo módulo.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-sm text-slate-400">Productos</p>
            <p className="mt-1 text-2xl font-semibold text-white">{data.medicamentos.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-sm text-slate-400">Stock total</p>
            <p className="mt-1 text-2xl font-semibold text-white">{medicamentosConInfo.reduce((sum, item) => sum + item.stockTotal, 0)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-sm text-slate-400">Por vencer</p>
            <p className="mt-1 text-2xl font-semibold text-white">{medicamentosConInfo.filter((item) => item.estado === 'proximo').length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-sm text-slate-400">Vencidos</p>
            <p className="mt-1 text-2xl font-semibold text-white">{medicamentosConInfo.filter((item) => item.estado === 'vencido').length}</p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="space-y-3">
          {medicamentosConInfo.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
              No hay medicamentos cargados todavía.
            </div>
          ) : (
            medicamentosConInfo.map((medicamento) => (
              <article key={medicamento.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/20">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-400">{medicamento.id}</p>
                    <h2 className="mt-1 text-xl font-semibold text-white">{medicamento.nombre}</h2>
                    <p className="mt-2 text-sm text-slate-300">{medicamento.proveedor || 'Sin proveedor'}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMedicamentoSeleccionado(medicamento.id);
                        setCantidadVenta(1);
                        setMensajeVenta('');
                      }}
                      disabled={medicamento.stockTotal === 0}
                      className={
                        'rounded-2xl px-4 py-2 text-sm font-semibold transition ' +
                        (medicamento.stockTotal > 0
                          ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'
                          : 'bg-slate-800 text-slate-500')
                      }
                    >
                      Vender
                    </button>
                    <button type="button" onClick={() => deleteMedicamento(medicamento.id)} className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-medium text-rose-200">
                      Borrar
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300 sm:grid-cols-4">
                  <div>
                    <p className="text-slate-500">Stock</p>
                    <p className="mt-1">{medicamento.stockTotal}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Vence</p>
                    <p className="mt-1">{medicamento.proximoVencimiento ? formatearFecha(medicamento.proximoVencimiento) : 'Sin lotes'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Compra</p>
                    <p className="mt-1">{'$' + medicamento.precioCompra}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Venta</p>
                    <p className="mt-1">{'$' + medicamento.precioVenta}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
                  <p>
                    Estado:{' '}
                    {medicamento.estado === 'ok'
                      ? 'OK'
                      : medicamento.estado === 'proximo'
                      ? 'Vence en ' + medicamento.diasRestantes + ' días'
                      : 'Vencido'}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="space-y-6">
          <form onSubmit={handleAddMedicamento} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
            <h2 className="text-xl font-semibold text-white">Agregar medicamento</h2>
            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Nombre</span>
                <input value={medForm.nombre} onChange={(event) => setMedForm({ ...medForm, nombre: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Proveedor</span>
                <input value={medForm.proveedor} onChange={(event) => setMedForm({ ...medForm, proveedor: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Precio compra</span>
                  <input type="number" value={medForm.precioCompra} onChange={(event) => setMedForm({ ...medForm, precioCompra: Number(event.target.value) })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Precio venta</span>
                  <input type="number" value={medForm.precioVenta} onChange={(event) => setMedForm({ ...medForm, precioVenta: Number(event.target.value) })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
                </label>
              </div>
            </div>
            <button type="submit" className="mt-5 w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
              Guardar medicamento
            </button>
          </form>

          <form onSubmit={handleAddLote} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
            <h2 className="text-xl font-semibold text-white">Agregar stock</h2>
            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Medicamento</span>
                <select value={loteForm.medicamentoId} onChange={(event) => setLoteForm({ ...loteForm, medicamentoId: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400">
                  <option value="" className="bg-slate-900">Seleccionar medicamento</option>
                  {data.medicamentos.map((medicamento) => (
                    <option key={medicamento.id} value={medicamento.id} className="bg-slate-900">
                      {medicamento.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Número de lote</span>
                <input value={loteForm.numeroLote} onChange={(event) => setLoteForm({ ...loteForm, numeroLote: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Vencimiento</span>
                  <input type="date" value={loteForm.fechaVencimiento} onChange={(event) => setLoteForm({ ...loteForm, fechaVencimiento: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Cantidad</span>
                  <input type="number" value={loteForm.cantidadDisponible} onChange={(event) => setLoteForm({ ...loteForm, cantidadDisponible: Number(event.target.value) })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
                </label>
              </div>
            </div>
            <button type="submit" className="mt-5 w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
              Guardar lote
            </button>
          </form>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
            <h2 className="text-xl font-semibold text-white">Venta rápida</h2>
            <p className="mt-1 text-sm text-slate-400">Se descuenta por FIFO: primero vence, primero sale.</p>
            {medicamentoSeleccionado ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <p className="text-slate-500">Medicamento</p>
                  <p className="mt-1 text-base font-semibold text-white">
                    {data.medicamentos.find((item) => item.id === medicamentoSeleccionado)?.nombre}
                  </p>
                  <p className="mt-2">Stock disponible: {calcularStockTotal(medicamentoSeleccionado, data.lotes)}</p>
                </div>
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Cantidad a vender</span>
                  <input type="number" min="1" value={cantidadVenta} onChange={(event) => setCantidadVenta(Number(event.target.value))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
                </label>
                {mensajeVenta ? <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-200">{mensajeVenta}</div> : null}
                <button type="button" onClick={procesarVentaMedicamento} className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
                  Confirmar venta
                </button>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-400">
                Seleccioná un medicamento para procesar la venta.
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
            <h2 className="text-xl font-semibold text-white">Lotes cargados</h2>
            <div className="mt-5 space-y-3">
              {data.lotes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-400">
                  No hay lotes cargados todavía.
                </div>
              ) : (
                data.lotes.map((lote) => {
                  const medicamento = data.medicamentos.find((item) => item.id === lote.medicamentoId);
                  const diasRestantes = calcularDiasHastaVencimiento(lote.fechaVencimiento);

                  return (
                    <div key={lote.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">{medicamento?.nombre}</p>
                          <p className="mt-1 text-slate-400">Lote {lote.numeroLote}</p>
                        </div>
                        <button type="button" onClick={() => deleteLote(lote.id)} className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs font-medium text-rose-200">
                          Borrar
                        </button>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-slate-500">Cantidad</p>
                          <p className="mt-1">{lote.cantidadDisponible}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Vencimiento</p>
                          <p className="mt-1">{formatearFecha(lote.fechaVencimiento)}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-slate-400">
                        {diasRestantes < 0 ? 'Vencido hace ' + Math.abs(diasRestantes) + ' días' : 'Restan ' + diasRestantes + ' días'}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
