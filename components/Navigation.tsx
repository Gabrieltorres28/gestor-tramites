'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  {
    name: 'Inicio',
    href: '/',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5.5v-7h-5v7H4a1 1 0 0 1-1-1v-10.5Z"
      />
    ),
  },
  {
    name: 'Clientes',
    href: '/clientes',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M16 19a4 4 0 0 0-8 0m8 0H8m8 0h4v-1a4 4 0 0 0-4-4h-1m-6 5H4v-1a4 4 0 0 1 4-4h1m0-4a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm8 2a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"
      />
    ),
  },
  {
    name: 'Trámites',
    href: '/tramites',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M7 4h7l5 5v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm7 1v4h4M9 13h6M9 17h6"
      />
    ),
  },
  {
    name: 'Caja',
    href: '/libro-diario',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Zm0 2.5h18M15 14h2"
      />
    ),
  },
  {
    name: 'Stock',
    href: '/medicamentos',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M10 4h4m-3 0v5.5l-5.4 8.1A2 2 0 0 0 7.26 21h9.48a2 2 0 0 0 1.66-3.4L13 9.5V4"
      />
    ),
  },
];

interface NavigationProps {
  businessName: string;
  ownerName: string;
  onLogout: () => void;
}

export default function Navigation({ businessName, ownerName, onLogout }: NavigationProps) {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-300">Panel seguro</p>
            <h1 className="truncate text-base font-semibold text-white sm:text-lg">{businessName}</h1>
            <p className="truncate text-xs text-slate-400">{ownerName}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            Salir
          </button>
        </div>
        <nav className="hidden border-t border-white/10 md:block">
          <div className="mx-auto flex max-w-6xl gap-2 px-4 py-3 sm:px-6 lg:px-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    isActive
                      ? 'bg-cyan-400 text-slate-950'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
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
                className={`flex min-h-[64px] flex-col items-center justify-center rounded-2xl px-1 text-center transition ${
                  isActive ? 'bg-cyan-400 text-slate-950' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <svg className="mb-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {item.icon}
                </svg>
                <span className="text-[11px] font-medium leading-tight">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
