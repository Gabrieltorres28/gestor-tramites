'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { loginSchema } from '@/lib/schemas/auth';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

function Spinner() {
  return <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />;
}

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-8 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = loginSchema.safeParse({ email, password });

        if (parsed.success === false) {
          setError(parsed.error.issues[0]?.message || 'Revisá los datos e intentá nuevamente.');
          return;
        }

        startTransition(async () => {
          const supabase = createSupabaseBrowserClient();
          const { error: loginError } = await supabase.auth.signInWithPassword(parsed.data);

          if (loginError) {
            setError('No pudimos iniciar sesión. Verificá tu email y contraseña.');
            return;
          }

          setError('');
          router.replace('/');
          router.refresh();
        });
      }}
    >
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-300">Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="username"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white/10"
          placeholder="admin@gestor.com"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-300">Contraseña</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white/10"
          placeholder="Escribí tu contraseña"
        />
      </label>
      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <Spinner /> : null}
        <span>{pending ? 'Ingresando...' : 'Entrar al panel'}</span>
      </button>
    </form>
  );
}
