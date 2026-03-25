'use client';

import type { SVGProps } from 'react';
import LogoutButton from '@/components/auth/LogoutButton';
import NavItemLink from '@/components/navigation/NavItemLink';

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><path d="M3 10.5 12 3l9 7.5" /><path d="M5.25 9.75V21h13.5V9.75" /><path d="M9.75 21v-6h4.5v6" /></svg>;
}

function ClientsIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}

function ProceduresIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><path d="M8 7h12" /><path d="M8 12h12" /><path d="M8 17h12" /><path d="M3 7h.01" /><path d="M3 12h.01" /><path d="M3 17h.01" /></svg>;
}

function CashIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M16 12h.01" /><path d="M7 12h4" /></svg>;
}

function StockIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>;
}

function AlertsIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><path d="M10.29 3.86 1.82 18A2 2 0 0 0 3.53 21h16.94A2 2 0 0 0 22.18 18l-8.47-14.14a2 2 0 0 0-3.42 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>;
}

const navigation = [
  { name: 'Inicio', href: '/', icon: HomeIcon },
  { name: 'Clientes', href: '/clientes', icon: ClientsIcon },
  { name: 'Trámites', href: '/tramites', icon: ProceduresIcon },
  { name: 'Caja', href: '/libro-diario', icon: CashIcon },
  { name: 'Stock', href: '/medicamentos', icon: StockIcon },
  { name: 'Vigencias', href: '/vigencias', icon: AlertsIcon },
];

interface NavigationProps {
  businessName: string;
  ownerName: string;
}

function BrandIcon() {
  return <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" /><path d="M12 12 4 7" /><path d="M12 12l8-5" /><path d="M12 12v9" /></svg></span>;
}

export default function Navigation({ businessName, ownerName }: NavigationProps) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <BrandIcon />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-300">Panel de gestión</p>
              <h1 className="truncate text-base font-semibold text-white sm:text-lg">{businessName}</h1>
              <p className="truncate text-xs text-slate-400">{ownerName}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
        <nav className="hidden border-t border-white/10 md:block">
          <div className="mx-auto flex max-w-6xl gap-2 px-4 py-3 sm:px-6 lg:px-8">
            {navigation.map((item) => (
              <NavItemLink key={item.href} href={item.href} label={item.name} icon={item.icon} />
            ))}
          </div>
        </nav>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur md:hidden">
        <div className="grid grid-cols-6 gap-1">
          {navigation.map((item) => (
            <NavItemLink key={item.href} href={item.href} label={item.name} icon={item.icon} mobile />
          ))}
        </div>
      </nav>
    </>
  );
}
