import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-10">
      <div className="w-full rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
        <h1 className="text-2xl font-semibold text-white">Acceso incompleto</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          El usuario autenticado no tiene todavía un perfil interno asociado en Prisma. Revisá el bootstrap inicial o cargá el usuario en la base.
        </p>
        <Link href="/login" className="mt-6 inline-flex rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950">
          Volver al login
        </Link>
      </div>
    </div>
  );
}
