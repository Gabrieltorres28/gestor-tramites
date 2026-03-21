import { redirect } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import { getCurrentUserContext } from '@/lib/auth/session';

export default async function LoginPage() {
  const user = await getCurrentUserContext();

  if (user) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.24),_transparent_32%)]" />
      <div className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Acceso privado</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Gestor previsional</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Ingresá con un usuario real de Supabase Auth. Los datos del negocio ya no dependen del navegador ni del dispositivo.
        </p>
        <LoginForm />
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <p className="font-medium text-white">Bootstrap inicial</p>
          <p className="mt-2 text-slate-400">
            Si configurás `APP_BOOTSTRAP_ADMIN_EMAIL`, el primer login con ese email crea automáticamente el negocio y el usuario admin en Prisma.
          </p>
        </div>
      </div>
    </div>
  );
}
