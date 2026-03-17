'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useAppData } from '@/components/AppProvider';

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, isReady, isAuthenticated, logout } = useAppData();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!isAuthenticated && pathname !== '/login') {
      router.replace('/login');
      return;
    }

    if (isAuthenticated && pathname === '/login') {
      router.replace('/');
    }
  }, [isAuthenticated, isReady, pathname, router]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-center shadow-2xl backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Gestor</p>
          <h1 className="mt-2 text-2xl font-semibold">Cargando sistema</h1>
        </div>
      </div>
    );
  }

  const isLoginPage = pathname === '/login';

  if (!isAuthenticated && !isLoginPage) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {!isLoginPage ? (
        <Navigation
          businessName={data.settings.businessName}
          ownerName={data.settings.ownerName}
          onLogout={logout}
        />
      ) : null}
      <main className={isLoginPage ? '' : 'pb-24 md:pb-10'}>{children}</main>
    </div>
  );
}
