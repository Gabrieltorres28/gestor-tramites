'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(async () => {
          const supabase = createSupabaseBrowserClient();
          await supabase.auth.signOut();
          router.replace('/login');
          router.refresh();
        });
      }}
      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
    >
      {pending ? 'Saliendo...' : 'Salir'}
    </button>
  );
}
