'use client';

import { useState } from 'react';
import { useAppData } from '@/components/AppProvider';
import { EstadoTramite, TipoTramite } from '@/types';

const estados: Array<EstadoTramite | 'Todos'> = ['Todos', 'En proceso', 'Finalizado', 'Cobrado'];
const tipos: TipoTramite[] = ['Jubilación', 'Pensión', 'Medicamentos', 'Subsidio', 'Otro'];

export default function TramitesPage() {
  const { data, addTramite, updateTramiteEstado, deleteTramite } = useAppData();
  const [filtroEstado, setFiltroEstado] = useState<EstadoTramite | 'Todos'>('Todos');
  const [form, setForm] = useState({
    clienteId: '',
    tipo: 'Jubilación' as TipoTramite,
    montoGestionado: 0,
    porcentajeComision: 15,
    estado: 'En proceso' as EstadoTramite,
    fechaInicio: new Date().toISOString().split('T')[0],
    descripcion: '',
  });

  const tramites = filtroEstado === 'Todos'
    ? data.tramites
    : data.tramites.filter((tramite) => tramite.estado === filtroEstado);

  const handleClientChange = (clienteId: string) => {
    const cliente = data.clientes.find((item) => item.id === clienteId);
    setForm((current) => ({
      ...current,
      clienteId,
      tipo: cliente?.tipoTramite || current.tipo,
      porcentajeComision: cliente?.porcentajeComision || current.porcentajeComision,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.clienteId || form.montoGestionado <= 0) {
      return;
    }

    addTramite(form);
    setForm({
      clienteId: '',
      tipo: 'Jubilación',
      montoGestionado: 0,
      porcentajeComision: 15,
      estado: 'En proceso',
      fechaInicio: new Date().toISOString().split('T')[0],
      descripcion: '',
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Trámites</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Seguimiento operativo</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Cada cambio de estado queda persistido. Si un trámite pasa a cobrado, la comisión se registra automáticamente en caja.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-400">En proceso</p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {data.tramites.filter((tramite) => tramite.estado === 'En proceso').length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-400">Finalizados</p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {data.tramites.filter((tramite) => tramite.estado === 'Finalizado').length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-400">Cobrados</p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {data.tramites.filter((tramite) => tramite.estado === 'Cobrado').length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-400">Comisiones</p>
              <p className="mt-1 text-lg font-semibold text-white">
                {'$' + data.tramites.reduce((sum, tramite) => sum + tramite.comisionCalculada, 0).toLocaleString('es-AR')}
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {estados.map((estado) => (
              <button
                key={estado}
                type="button"
                onClick={() => setFiltroEstado(estado)}
                className={
                  'rounded-full px-4 py-2 text-sm transition ' +
                  (filtroEstado === estado
                    ? 'bg-cyan-400 text-slate-950'
                    : 'border border-white/10 bg-slate-950/40 text-slate-300')
                }
              >
                {estado}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
          <h2 className="text-xl font-semibold text-white">Nuevo trámite</h2>
          <p className="mt-1 text-sm text-slate-400">Alta rápida para trabajar desde el teléfono.</p>
          {data.clientes.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-300">
              Primero cargá un cliente para poder crear un trámite.
            </div>
          ) : (
            <>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-sm text-slate-300">Cliente</span>
                  <select value={form.clienteId} onChange={(event) => handleClientChange(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400">
                    <option value="" className="bg-slate-900">Seleccionar cliente</option>
                    {data.clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id} className="bg-slate-900">
                        {cliente.nombre}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Tipo</span>
                  <select value={form.tipo} onChange={(event) => setForm({ ...form, tipo: event.target.value as TipoTramite })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400">
                    {tipos.map((tipo) => (
                      <option key={tipo} value={tipo} className="bg-slate-900">
                        {tipo}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Estado inicial</span>
                  <select value={form.estado} onChange={(event) => setForm({ ...form, estado: event.target.value as EstadoTramite })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400">
                    <option className="bg-slate-900">En proceso</option>
                    <option className="bg-slate-900">Finalizado</option>
                    <option className="bg-slate-900">Cobrado</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Monto gestionado</span>
                  <input type="number" value={form.montoGestionado} onChange={(event) => setForm({ ...form, montoGestionado: Number(event.target.value) })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Comisión %</span>
                  <input type="number" value={form.porcentajeComision} onChange={(event) => setForm({ ...form, porcentajeComision: Number(event.target.value) })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-sm text-slate-300">Fecha de inicio</span>
                  <input type="date" value={form.fechaInicio} onChange={(event) => setForm({ ...form, fechaInicio: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-sm text-slate-300">Descripción</span>
                  <textarea rows={4} value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
                </label>
              </div>
              <button type="submit" className="mt-5 w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
                Guardar trámite
              </button>
            </>
          )}
        </form>
      </section>

      <section className="mt-6 space-y-3">
        {tramites.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
            No hay trámites cargados todavía.
          </div>
        ) : (
          tramites.map((tramite) => (
            <article key={tramite.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-slate-400">{tramite.id}</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">{tramite.clienteNombre}</h2>
                  <p className="mt-2 text-sm text-slate-300">{tramite.descripcion || 'Sin descripción cargada.'}</p>
                </div>
                <div className="sm:w-56 space-y-2">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-slate-500">Actualizar estado</p>
                    <select value={tramite.estado} onChange={(event) => updateTramiteEstado(tramite.id, event.target.value as EstadoTramite)} className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 outline-none focus:border-cyan-400">
                      <option className="bg-slate-900">En proceso</option>
                      <option className="bg-slate-900">Finalizado</option>
                      <option className="bg-slate-900">Cobrado</option>
                    </select>
                  </div>
                  <button type="button" onClick={() => deleteTramite(tramite.id)} className="w-full rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-medium text-rose-200">
                    Borrar trámite
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300 sm:grid-cols-5">
                <div>
                  <p className="text-slate-500">Tipo</p>
                  <p className="mt-1">{tramite.tipo}</p>
                </div>
                <div>
                  <p className="text-slate-500">Monto</p>
                  <p className="mt-1">{'$' + tramite.montoGestionado.toLocaleString('es-AR')}</p>
                </div>
                <div>
                  <p className="text-slate-500">Comisión</p>
                  <p className="mt-1">{tramite.porcentajeComision}%</p>
                </div>
                <div>
                  <p className="text-slate-500">Generado</p>
                  <p className="mt-1">{'$' + tramite.comisionCalculada.toLocaleString('es-AR')}</p>
                </div>
                <div>
                  <p className="text-slate-500">Inicio</p>
                  <p className="mt-1">{tramite.fechaInicio}</p>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
