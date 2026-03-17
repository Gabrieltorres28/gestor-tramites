'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/components/AppProvider';

export default function LoginPage() {
  const router = useRouter();
  const { data, login } = useAppData();
  const [email, setEmail] = useState(data.settings.loginEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = login(email, password);

    if (!result.ok) {
      setError(result.message || 'No se pudo iniciar sesión.');
      return;
    }

    setError('');
    router.replace('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.24),_transparent_32%)]" />
      <div className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Acceso privado</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">{data.settings.businessName}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Link listo para entregar con login. El cliente entra, carga sus datos y quedan guardados en este navegador.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white/10"
              placeholder="123456"
            />
          </label>
          {error ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Ingresar al panel
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <p className="font-medium text-white">Acceso inicial</p>
          <p className="mt-2">Email: {data.settings.loginEmail}</p>
          <p>Contraseña: {data.settings.loginPassword}</p>
          <p className="mt-3 text-xs text-slate-400">Podés cambiar estas credenciales desde el dashboard una vez dentro.</p>
        </div>
      </div>
    </div>
  );
}
