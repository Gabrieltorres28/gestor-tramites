import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUserContext } from '@/lib/auth/session';
import { getMedicines } from '@/lib/data/medicines';
import { createMedicine, createMedicineBatch, deleteMedicine, deleteMedicineBatch, sellMedicine } from '@/lib/services/medicine.service';
import FeedbackBanner from '@/components/FeedbackBanner';
import SubmitButton from '@/components/ui/SubmitButton';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function MedicamentosPage() {
  const user = await requireUserContext();
  const medicines = await getMedicines(user.businessId);

  async function addMedicineAction(formData: FormData) {
    'use server';
    const currentUser = await requireUserContext();
    const result = await createMedicine(currentUser, { name: String(formData.get('name') || ''), supplier: String(formData.get('supplier') || ''), purchasePrice: Number(formData.get('purchasePrice') || 0), salePrice: Number(formData.get('salePrice') || 0) });
    revalidatePath('/medicamentos');
    revalidatePath('/');
    if (result.ok) {
      redirect('/medicamentos?notice=medicine-created');
    }
  }

  async function addBatchAction(formData: FormData) {
    'use server';
    const currentUser = await requireUserContext();
    const result = await createMedicineBatch(currentUser, { medicineId: String(formData.get('medicineId') || ''), batchNumber: String(formData.get('batchNumber') || ''), expirationDate: String(formData.get('expirationDate') || ''), quantityAvailable: Number(formData.get('quantityAvailable') || 0) });
    revalidatePath('/medicamentos');
    revalidatePath('/');
    if (result.ok) {
      redirect('/medicamentos?notice=batch-created');
    }
  }

  async function removeMedicineAction(formData: FormData) {
    'use server';
    const currentUser = await requireUserContext();
    const result = await deleteMedicine(currentUser, { medicineId: String(formData.get('medicineId') || '') });
    revalidatePath('/medicamentos');
    revalidatePath('/');
    if (result.ok) {
      redirect('/medicamentos?notice=medicine-deleted');
    }
  }

  async function removeBatchAction(formData: FormData) {
    'use server';
    const currentUser = await requireUserContext();
    const result = await deleteMedicineBatch(currentUser, { batchId: String(formData.get('batchId') || '') });
    revalidatePath('/medicamentos');
    revalidatePath('/');
    if (result.ok) {
      redirect('/medicamentos?notice=batch-deleted');
    }
  }

  async function sellMedicineAction(formData: FormData) {
    'use server';
    const currentUser = await requireUserContext();
    const result = await sellMedicine(currentUser, { medicineId: String(formData.get('medicineId') || ''), quantity: Number(formData.get('quantity') || 0) });
    revalidatePath('/medicamentos');
    revalidatePath('/');
    if (result.ok) {
      redirect('/medicamentos?notice=medicine-sold');
    }
  }

  return <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8"><FeedbackBanner /><section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/20 sm:p-6"><p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Medicamentos</p><h1 className="mt-3 text-3xl font-semibold text-white">Stock y vencimientos</h1></section><section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.95fr]"><div className="space-y-3">{medicines.map((medicine) => <article key={medicine.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/20"><div className="flex items-start justify-between gap-3"><div><h2 className="mt-1 text-xl font-semibold text-white">{medicine.name}</h2><p className="mt-2 text-sm text-slate-300">{medicine.supplier || 'Sin proveedor'}</p></div><div className="flex flex-col gap-2"><form action={sellMedicineAction}><input type="hidden" name="medicineId" value={medicine.id} /><input type="number" name="quantity" min="1" defaultValue="1" className="mb-2 w-24 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none" /><SubmitButton pendingText="Registrando..." className="rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950">Vender</SubmitButton></form><form action={removeMedicineAction}><input type="hidden" name="medicineId" value={medicine.id} /><SubmitButton pendingText="Borrando..." className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-medium text-rose-200">Borrar</SubmitButton></form></div></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300 sm:grid-cols-4"><div><p className="text-slate-500">Stock</p><p className="mt-1">{medicine.stockTotal}</p></div><div><p className="text-slate-500">Vence</p><p className="mt-1">{medicine.nextExpiration ? formatDate(medicine.nextExpiration) : 'Sin lotes'}</p></div><div><p className="text-slate-500">Compra</p><p className="mt-1">{formatCurrency(medicine.purchasePrice)}</p></div><div><p className="text-slate-500">Venta</p><p className="mt-1">{formatCurrency(medicine.salePrice)}</p></div></div><div className="mt-4 space-y-2">{medicine.batches.map((batch) => <div key={batch.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300"><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-white">Lote {batch.batchNumber}</p><p className="mt-1 text-slate-400">Vence {formatDate(batch.expirationDate)}</p></div><form action={removeBatchAction}><input type="hidden" name="batchId" value={batch.id} /><SubmitButton pendingText="Borrando..." className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs font-medium text-rose-200">Borrar</SubmitButton></form></div><p className="mt-3">Cantidad disponible: {batch.quantityAvailable}</p></div>)}</div></article>)}</div><div className="space-y-6"><form action={addMedicineAction} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20 sm:p-6"><h2 className="text-xl font-semibold text-white">Agregar medicamento</h2><div className="mt-5 grid gap-4"><label className="block"><span className="mb-2 block text-sm text-slate-300">Nombre</span><input name="name" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" /></label><label className="block"><span className="mb-2 block text-sm text-slate-300">Proveedor</span><input name="supplier" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" /></label><div className="grid grid-cols-2 gap-4"><label className="block"><span className="mb-2 block text-sm text-slate-300">Precio compra</span><input type="number" name="purchasePrice" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" /></label><label className="block"><span className="mb-2 block text-sm text-slate-300">Precio venta</span><input type="number" name="salePrice" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" /></label></div></div><SubmitButton pendingText="Guardando medicamento..." className="mt-5 w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">Guardar medicamento</SubmitButton></form><form action={addBatchAction} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20 sm:p-6"><h2 className="text-xl font-semibold text-white">Agregar stock</h2><div className="mt-5 grid gap-4"><label className="block"><span className="mb-2 block text-sm text-slate-300">Medicamento</span><select name="medicineId" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400">{medicines.map((medicine) => <option key={medicine.id} value={medicine.id} className="bg-slate-900">{medicine.name}</option>)}</select></label><label className="block"><span className="mb-2 block text-sm text-slate-300">Número de lote</span><input name="batchNumber" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" /></label><div className="grid grid-cols-2 gap-4"><label className="block"><span className="mb-2 block text-sm text-slate-300">Vencimiento</span><input type="date" name="expirationDate" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" /></label><label className="block"><span className="mb-2 block text-sm text-slate-300">Cantidad</span><input type="number" name="quantityAvailable" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" /></label></div></div><SubmitButton pendingText="Guardando lote..." className="mt-5 w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">Guardar lote</SubmitButton></form></div></section></div>;
}
