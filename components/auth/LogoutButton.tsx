'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

function Spinner() {
  return <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />;
}

export default function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const supabase = createSupabaseBrowserClient();
          await supabase.auth.signOut();
          router.replace('/login');
          router.refresh();
        });
      }}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? <Spinner /> : null}
      <span>{pending ? 'Cerrando...' : 'Cerrar sesión'}</span>
    </button>
  );
}
