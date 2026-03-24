'use client';

import { useState, useTransition } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function PasswordChangeCard() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pending, startTransition] = useTransition();

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
      <h2 className="text-xl font-semibold text-white">Acceso y seguridad</h2>
      <p className="mt-1 text-sm text-slate-400">
        Cada usuario puede actualizar su propia contraseña desde acá, sin afectar la configuración del sistema.
      </p>

      <form
        className="mt-5 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();

          if (password.length < 6) {
            setSuccess('');
            setError('La nueva contraseña debe tener al menos 6 caracteres.');
            return;
          }

          if (password !== confirmPassword) {
            setSuccess('');
            setError('Las contraseñas no coinciden.');
            return;
          }

          startTransition(async () => {
            const supabase = createSupabaseBrowserClient();
            const { error: updateError } = await supabase.auth.updateUser({ password });

            if (updateError) {
              setSuccess('');
              setError('No pudimos actualizar la contraseña. Intentá nuevamente en unos minutos.');
              return;
            }

            setError('');
            setSuccess('Contraseña actualizada correctamente.');
            setPassword('');
            setConfirmPassword('');
          });
        }}
      >
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Nueva contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 outline-none focus:border-cyan-400"
            placeholder="Elegí una nueva contraseña"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Repetir contraseña</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 outline-none focus:border-cyan-400"
            placeholder="Repetí la nueva contraseña"
          />
        </label>

        {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}
        {success ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{success}</div> : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 font-semibold text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Actualizando...' : 'Actualizar contraseña'}
        </button>
      </form>
    </section>
  );
}
