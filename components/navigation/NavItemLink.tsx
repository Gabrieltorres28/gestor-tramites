'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ComponentType, type SVGProps } from 'react';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type NavItemLinkProps = {
  href: string;
  label: string;
  icon: IconComponent;
  mobile?: boolean;
};

function Spinner() {
  return <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />;
}

export default function NavItemLink({ href, label, icon: Icon, mobile = false }: NavItemLinkProps) {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const isActive = pathname === href;

  useEffect(() => {
    setPending(false);
  }, [pathname]);

  const baseClassName = mobile
    ? isActive
      ? 'flex min-h-[68px] flex-col items-center justify-center rounded-2xl bg-cyan-400 px-1 text-center text-slate-950 transition'
      : 'flex min-h-[68px] flex-col items-center justify-center rounded-2xl px-1 text-center text-slate-400 transition hover:bg-white/5 hover:text-white'
    : isActive
      ? 'inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm text-slate-950 transition'
      : 'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white';

  return (
    <Link
      href={href}
      onClick={() => {
        if (pathname !== href) {
          setPending(true);
        }
      }}
      aria-busy={pending}
      className={`${baseClassName} ${pending ? 'scale-[0.98] opacity-80' : ''}`}
    >
      {pending ? <Spinner /> : <Icon className="h-5 w-5" />}
      <span className={mobile ? 'mt-1 text-[11px] font-medium leading-tight' : ''}>
        {pending ? (mobile ? 'Abriendo' : `Abriendo ${label}`) : label}
      </span>
    </Link>
  );
}
