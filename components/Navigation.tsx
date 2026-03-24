'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/auth/LogoutButton';

const navigation = [
  { name: 'Inicio', href: '/' },
  { name: 'Clientes', href: '/clientes' },
  { name: 'Trámites', href: '/tramites' },
  { name: 'Caja', href: '/libro-diario' },
  { name: 'Stock', href: '/medicamentos' },
];

interface NavigationProps {
  businessName: string;
  ownerName: string;
}

export default function Navigation({ businessName, ownerName }: NavigationProps) {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-300">Panel de gestión</p>
            <h1 className="truncate text-base font-semibold text-white sm:text-lg">{businessName}</h1>
            <p className="truncate text-xs text-slate-400">{ownerName}</p>
          </div>
          <LogoutButton />
        </div>
        <nav className="hidden border-t border-white/10 md:block">
          <div className="mx-auto flex max-w-6xl gap-2 px-4 py-3 sm:px-6 lg:px-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={isActive ? 'rounded-full bg-cyan-400 px-4 py-2 text-sm text-slate-950 transition' : 'rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white'}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur md:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? 'flex min-h-[64px] flex-col items-center justify-center rounded-2xl bg-cyan-400 px-1 text-center text-slate-950 transition' : 'flex min-h-[64px] flex-col items-center justify-center rounded-2xl px-1 text-center text-slate-400 transition hover:bg-white/5 hover:text-white'}
              >
                <span className="text-[11px] font-medium leading-tight">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
