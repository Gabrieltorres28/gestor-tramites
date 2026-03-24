import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  console.log('[page:/] render start');

  try {
    const user = await getCurrentUserContext();

    console.log('[page:/] user context result', {
      hasUser: user !== null,
      userId: user?.userId ?? null,
      businessId: user?.businessId ?? null,
      role: user?.role ?? null,
    });

    if (user === null) {
      console.log('[page:/] redirect to /login because user context is null');
      redirect('/login');
    }

    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/20">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Debug Home</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">ok</h1>
          <p className="mt-4 text-sm text-slate-300">La app llego a renderizar la home server-side.</p>
          <div className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-slate-500">User ID</p>
              <p className="mt-1 break-all text-white">{user.userId}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-slate-500">Business ID</p>
              <p className="mt-1 break-all text-white">{user.businessId}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-slate-500">Email</p>
              <p className="mt-1 break-all text-white">{user.email}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-slate-500">Role</p>
              <p className="mt-1 text-white">{user.role}</p>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('[page:/] render crash', error);
    throw error;
  }
}
