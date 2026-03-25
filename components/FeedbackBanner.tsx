'use client';

import { useEffect, useMemo, useState } from 'react';
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

function SuccessIcon() {
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-100 shadow-lg shadow-emerald-950/20">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

export default function FeedbackBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const notice = searchParams.get('notice') || '';
  const message = notices[notice];
  const [visible, setVisible] = useState(false);

  const cleanPath = useMemo(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('notice');
    const query = nextParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const hideTimer = window.setTimeout(() => {
      setVisible(false);
    }, 3200);
    const clearUrlTimer = window.setTimeout(() => {
      router.replace(cleanPath, { scroll: false });
    }, 3600);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(clearUrlTimer);
    };
  }, [cleanPath, message, router]);

  if (!message) {
    return null;
  }

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4 transition-all duration-300 sm:bottom-6 sm:justify-end sm:px-6 lg:px-8 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}
      aria-live="polite"
    >
      <div className="pointer-events-auto w-full max-w-md rounded-[1.75rem] border border-emerald-400/20 bg-slate-950/95 p-4 text-emerald-50 shadow-2xl shadow-emerald-950/30 backdrop-blur">
        <div className="flex items-start gap-3">
          <SuccessIcon />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-300">Acción completada</p>
            <p className="mt-1 text-sm font-medium leading-6 text-white">{message}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setVisible(false);
              router.replace(cleanPath, { scroll: false });
            }}
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/5"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
