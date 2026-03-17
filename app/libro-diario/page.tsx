'use client';

import { useState } from 'react';
import { useAppData } from '@/components/AppProvider';
import { MedioPago, TipoMovimiento } from '@/types';

const tiposMovimiento: Array<TipoMovimiento | 'Todos'> = ['Todos', 'Ingreso comisión', 'Ingreso cliente', 'Egreso', 'Gasto'];
const mediosPago: MedioPago[] = ['Efectivo', 'Transferencia', 'Cheque', 'Débito', 'Crédito'];

export default function LibroDiarioPage() {
  const { data, addMovimiento, deleteMovimiento } = useAppData();
  const [filtroTipo, setFiltroTipo] = useState<TipoMovimiento | 'Todos'>('Todos');
  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tipo: 'Ingreso cliente' as TipoMovimiento,
    monto: 0,
    medioPago: 'Transferencia' as MedioPago,
    descripcion: '',
  });

  const movimientos = filtroTipo === 'Todos'
    ? data.movimientos
    : data.movimientos.filter((movimiento) => movimiento.tipo === filtroTipo);

  const movimientosOrdenados = [...movimientos].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  const saldo = data.movimientos.reduce((sum, movimiento) => sum + movimiento.monto, 0);
  const ingresos = data.movimientos.filter((movimiento) => movimiento.monto > 0).reduce((sum, movimiento) => sum + movimiento.monto, 0);
  const egresos = data.movimientos.filter((movimiento) => movimiento.monto < 0).reduce((sum, movimiento) => sum + Math.abs(movimiento.monto), 0);
  const comisiones = data.movimientos
    .filter((movimiento) => movimiento.tipo === 'Ingreso comisión')
    .reduce((sum, movimiento) => sum + movimiento.monto, 0);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.descripcion.trim() || form.monto <= 0) {
      return;
    }

    addMovimiento(form);
    setForm({
      fecha: new Date().toISOString().split('T')[0],
      tipo: 'Ingreso cliente',
      monto: 0,
      medioPago: 'Transferencia',
      descripcion: '',
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Libro diario</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Caja y movimientos</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Ingresos, gastos y retiros quedan listos para consultar desde el celular, con el saldo actualizado al instante.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-400">Saldo</p>
              <p className="mt-1 text-xl font-semibold text-white">{'$' + saldo.toLocaleString('es-AR')}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-400">Ingresos</p>
              <p className="mt-1 text-xl font-semibold text-white">{'$' + ingresos.toLocaleString('es-AR')}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-400">Egresos</p>
              <p className="mt-1 text-xl font-semibold text-white">{'$' + egresos.toLocaleString('es-AR')}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-400">Comisiones</p>
              <p className="mt-1 text-xl font-semibold text-white">{'$' + comisiones.toLocaleString('es-AR')}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {tiposMovimiento.map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => setFiltroTipo(tipo)}
                className={
                  'rounded-full px-4 py-2 text-sm transition ' +
                  (filtroTipo === tipo
                    ? 'bg-cyan-400 text-slate-950'
                    : 'border border-white/10 bg-slate-950/40 text-slate-300')
                }
              >
                {tipo}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
          <h2 className="text-xl font-semibold text-white">Nuevo movimiento</h2>
          <p className="mt-1 text-sm text-slate-400">Carga directa para usar mientras trabajás.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Fecha</span>
              <input type="date" value={form.fecha} onChange={(event) => setForm({ ...form, fecha: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Tipo</span>
              <select value={form.tipo} onChange={(event) => setForm({ ...form, tipo: event.target.value as TipoMovimiento })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400">
                <option className="bg-slate-900">Ingreso comisión</option>
                <option className="bg-slate-900">Ingreso cliente</option>
                <option className="bg-slate-900">Egreso</option>
                <option className="bg-slate-900">Gasto</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Monto</span>
              <input type="number" value={form.monto} onChange={(event) => setForm({ ...form, monto: Number(event.target.value) })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Medio de pago</span>
              <select value={form.medioPago} onChange={(event) => setForm({ ...form, medioPago: event.target.value as MedioPago })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400">
                {mediosPago.map((medio) => (
                  <option key={medio} value={medio} className="bg-slate-900">
                    {medio}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm text-slate-300">Descripción</span>
              <textarea rows={4} value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
            </label>
          </div>
          <button type="submit" className="mt-5 w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
            Guardar movimiento
          </button>
        </form>
      </section>

      <section className="mt-6 space-y-3">
        {movimientosOrdenados.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
            No hay movimientos cargados todavía.
          </div>
        ) : (
          movimientosOrdenados.map((movimiento) => (
            <article key={movimiento.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/20">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">{movimiento.fecha}</p>
                  <h2 className="mt-1 text-lg font-semibold text-white">{movimiento.descripcion}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs font-medium text-slate-200">
                    {movimiento.tipo}
                  </span>
                  <button type="button" onClick={() => deleteMovimiento(movimiento.id)} className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs font-medium text-rose-200">
                    Borrar
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300 sm:grid-cols-4">
                <div>
                  <p className="text-slate-500">Medio</p>
                  <p className="mt-1">{movimiento.medioPago}</p>
                </div>
                <div>
                  <p className="text-slate-500">Monto</p>
                  <p className="mt-1">{(movimiento.monto > 0 ? '+' : '-') + '$' + Math.abs(movimiento.monto).toLocaleString('es-AR')}</p>
                </div>
                <div>
                  <p className="text-slate-500">Referencia</p>
                  <p className="mt-1">{movimiento.tramiteId || 'Manual'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Impacto</p>
                  <p className="mt-1">{movimiento.monto >= 0 ? 'Ingreso' : 'Salida'}</p>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
