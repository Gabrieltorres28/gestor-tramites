import { ProcedureType } from '@prisma/client';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireUserContext } from '@/lib/auth/session';
import { getClients } from '@/lib/data/clients';
import { createClient, deleteClient } from '@/lib/services/client.service';
import FeedbackBanner from '@/components/FeedbackBanner';
import { procedureTypeLabels } from '@/lib/types/app';

export default async function ClientesPage() {
  const user = await requireUserContext();
  const [clients, settings] = await Promise.all([
    getClients(user.businessId),
    db.businessSettings.findUnique({ where: { id: user.businessId } }),
  ]);

  async function createClientAction(formData: FormData) {
    'use server';
    const currentUser = await requireUserContext();
    const result = await createClient(currentUser, {
      fullName: String(formData.get('fullName') || ''),
      dni: String(formData.get('dni') || ''),
      phone: String(formData.get('phone') || ''),
      email: String(formData.get('email') || ''),
      notes: String(formData.get('notes') || ''),
      procedureType: String(formData.get('procedureType') || ProcedureType.RETIREMENT),
      commissionRate: Number(formData.get('commissionRate') || 0),
    });
    revalidatePath('/clientes');
    revalidatePath('/tramites');
    revalidatePath('/');
    if (result.ok) {
      redirect('/clientes?notice=client-created');
    }
  }

  async function removeClientAction(formData: FormData) {
    'use server';
    const currentUser = await requireUserContext();
    const result = await deleteClient(currentUser, { clientId: String(formData.get('clientId') || '') });
    revalidatePath('/clientes');
    revalidatePath('/tramites');
    revalidatePath('/libro-diario');
    revalidatePath('/');
    if (result.ok) {
      redirect('/clientes?notice=client-deleted');
    }
  }

  const averageCommission = clients.length ? clients.reduce((sum, client) => sum + client.commissionRate, 0) / clients.length : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <FeedbackBanner />
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Clientes</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Base de clientes del estudio</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">Centralizá la información de cada cliente y mantené cada gestión conectada con el resto del estudio.</p>
          <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"><p className="text-slate-400">Total</p><p className="mt-1 text-2xl font-semibold text-white">{clients.length}</p></div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"><p className="text-slate-400">Activos</p><p className="mt-1 text-2xl font-semibold text-white">{clients.filter((client) => client.status === 'Activo').length}</p></div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"><p className="text-slate-400">Comisión prom.</p><p className="mt-1 text-2xl font-semibold text-white">{averageCommission.toFixed(1)}%</p></div>
          </div>
        </div>

        <form action={createClientAction} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
          <h2 className="text-xl font-semibold text-white">Nuevo cliente</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2"><span className="mb-2 block text-sm text-slate-300">Nombre completo</span><input name="fullName" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" /></label>
            <label className="block"><span className="mb-2 block text-sm text-slate-300">DNI</span><input name="dni" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" /></label>
            <label className="block"><span className="mb-2 block text-sm text-slate-300">Comisión %</span><input type="number" name="commissionRate" defaultValue={settings?.defaultCommissionRate.toString() || '15'} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" /></label>
            <label className="block sm:col-span-2"><span className="mb-2 block text-sm text-slate-300">Tipo de trámite</span><select name="procedureType" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400">{Object.values(ProcedureType).map((type) => <option key={type} value={type} className="bg-slate-900">{procedureTypeLabels[type]}</option>)}</select></label>
            <label className="block"><span className="mb-2 block text-sm text-slate-300">Teléfono</span><input name="phone" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" /></label>
            <label className="block"><span className="mb-2 block text-sm text-slate-300">Email (opcional)</span><input name="email" type="email" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" /></label>
            <label className="block sm:col-span-2"><span className="mb-2 block text-sm text-slate-300">Notas</span><textarea name="notes" rows={4} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" /></label>
          </div>
          <button type="submit" className="mt-5 w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">Guardar cliente</button>
        </form>
      </section>

      <section className="mt-6 space-y-3">
        {clients.map((client) => (
          <article key={client.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/20">
            <div className="flex items-start justify-between gap-3"><div><p className="text-sm text-slate-400">{client.dni}</p><h2 className="mt-1 text-xl font-semibold text-white">{client.fullName}</h2></div><div className="flex items-center gap-2"><span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">{client.status}</span><form action={removeClientAction}><input type="hidden" name="clientId" value={client.id} /><button type="submit" className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs font-medium text-rose-200">Borrar</button></form></div></div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300 sm:grid-cols-4"><div><p className="text-slate-500">Trámite</p><p className="mt-1">{client.procedureType}</p></div><div><p className="text-slate-500">Comisión</p><p className="mt-1">{client.commissionRate}%</p></div><div><p className="text-slate-500">Teléfono</p><p className="mt-1">{client.phone || 'Sin dato'}</p></div><div><p className="text-slate-500">Alta</p><p className="mt-1">{client.createdAt}</p></div></div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300"><p><span className="text-slate-500">Email:</span> {client.email || 'Sin dato'}</p><p className="mt-2"><span className="text-slate-500">Notas:</span> {client.notes || 'Sin notas'}</p></div>
          </article>
        ))}
      </section>
    </div>
  );
}
