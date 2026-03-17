'use client';

import { useState } from 'react';
import { useAppData } from '@/components/AppProvider';
import { TipoTramite } from '@/types';

const tiposTramite: TipoTramite[] = ['Jubilación', 'Pensión', 'Medicamentos', 'Subsidio', 'Otro'];

export default function ClientesPage() {
  const { data, addCliente, deleteCliente } = useAppData();
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    nombre: '',
    dni: '',
    tipoTramite: 'Jubilación' as TipoTramite,
    porcentajeComision: 15,
    telefono: '',
    email: '',
    notas: '',
  });

  const clientesFiltrados = data.clientes.filter((cliente) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      cliente.nombre.toLowerCase().includes(query) ||
      cliente.dni.toLowerCase().includes(query) ||
      (cliente.email || '').toLowerCase().includes(query)
    );
  });

  const promedioComision = data.clientes.length
    ? data.clientes.reduce((sum, cliente) => sum + cliente.porcentajeComision, 0) / data.clientes.length
    : 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.nombre.trim() || !form.dni.trim()) {
      return;
    }

    addCliente(form);
    setForm({
      nombre: '',
      dni: '',
      tipoTramite: 'Jubilación',
      porcentajeComision: 15,
      telefono: '',
      email: '',
      notas: '',
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Clientes</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Base de clientes persistente</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Cargá nombre, contacto, comisión y notas. Todo queda guardado al recargar.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-slate-400">Total</p>
              <p className="mt-1 text-2xl font-semibold text-white">{data.clientes.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-slate-400">Activos</p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {data.clientes.filter((cliente) => cliente.estado === 'Activo').length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-slate-400">Comisión prom.</p>
              <p className="mt-1 text-2xl font-semibold text-white">{promedioComision.toFixed(1)}%</p>
            </div>
          </div>
          <div className="mt-5">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, DNI o email"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
          <h2 className="text-xl font-semibold text-white">Nuevo cliente</h2>
          <p className="mt-1 text-sm text-slate-400">Formulario pensado para cargar rápido desde mobile.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm text-slate-300">Nombre completo</span>
              <input value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">DNI</span>
              <input value={form.dni} onChange={(event) => setForm({ ...form, dni: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Comisión %</span>
              <input type="number" value={form.porcentajeComision} onChange={(event) => setForm({ ...form, porcentajeComision: Number(event.target.value) })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm text-slate-300">Tipo de trámite</span>
              <select value={form.tipoTramite} onChange={(event) => setForm({ ...form, tipoTramite: event.target.value as TipoTramite })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400">
                {tiposTramite.map((tipo) => (
                  <option key={tipo} value={tipo} className="bg-slate-900">
                    {tipo}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Teléfono</span>
              <input value={form.telefono} onChange={(event) => setForm({ ...form, telefono: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Email</span>
              <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm text-slate-300">Notas</span>
              <textarea value={form.notas} onChange={(event) => setForm({ ...form, notas: event.target.value })} rows={4} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
            </label>
          </div>
          <button type="submit" className="mt-5 w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
            Guardar cliente
          </button>
        </form>
      </section>

      <section className="mt-6 space-y-3">
        {clientesFiltrados.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
            No hay clientes cargados todavía.
          </div>
        ) : (
          clientesFiltrados.map((cliente) => (
            <article key={cliente.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/20">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">{cliente.dni}</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">{cliente.nombre}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                    {cliente.estado}
                  </span>
                  <button type="button" onClick={() => deleteCliente(cliente.id)} className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs font-medium text-rose-200">
                    Borrar
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300 sm:grid-cols-4">
                <div>
                  <p className="text-slate-500">Trámite</p>
                  <p className="mt-1">{cliente.tipoTramite}</p>
                </div>
                <div>
                  <p className="text-slate-500">Comisión</p>
                  <p className="mt-1">{cliente.porcentajeComision}%</p>
                </div>
                <div>
                  <p className="text-slate-500">Teléfono</p>
                  <p className="mt-1">{cliente.telefono || 'Sin dato'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Alta</p>
                  <p className="mt-1">{cliente.fechaAlta}</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
                <p><span className="text-slate-500">Email:</span> {cliente.email || 'Sin dato'}</p>
                <p className="mt-2"><span className="text-slate-500">Notas:</span> {cliente.notas || 'Sin notas'}</p>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
