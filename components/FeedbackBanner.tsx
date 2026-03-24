'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const notices: Record<string, string> = {
  'client-created': 'Cliente guardado con éxito.',
  'client-deleted': 'Cliente eliminado con éxito.',
  'procedure-created': 'Trámite guardado con éxito.',
  'procedure-updated': 'Estado del trámite actualizado con éxito.',
  'procedure-deleted': 'Trámite eliminado con éxito.',
  'cash-created': 'Movimiento guardado con éxito.',
  'cash-deleted': 'Movimiento eliminado con éxito.',
  'medicine-created': 'Medicamento guardado con éxito.',
  'medicine-deleted': 'Medicamento eliminado con éxito.',
  'batch-created': 'Stock agregado con éxito.',
  'batch-deleted': 'Lote eliminado con éxito.',
  'medicine-sold': 'Venta registrada con éxito.',
};

export default function FeedbackBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const notice = searchParams.get('notice') || '';
  const message = notices[notice];

  if (!message) {
    return null;
  }

  return (
    <div className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100 shadow-lg shadow-emerald-950/10">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-200">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M20 6 9 17l-5-5" /></svg>
        </span>
        <p>{message}</p>
      </div>
      <button
        type="button"
        onClick={() => router.replace(pathname)}
        className="rounded-full border border-white/10 px-2 py-1 text-xs text-emerald-100 transition hover:bg-white/5"
      >
        Cerrar
      </button>
    </div>
  );
}
