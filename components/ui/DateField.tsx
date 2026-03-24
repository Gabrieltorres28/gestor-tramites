import type { InputHTMLAttributes } from 'react';

type DateFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
  wrapperClassName?: string;
};

function CalendarIcon() {
  return (
    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-cyan-300/80">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4" />
        <path d="M8 3v4" />
        <path d="M3 10h18" />
      </svg>
    </span>
  );
}

export default function DateField({ label, wrapperClassName = '', className = '', ...props }: DateFieldProps) {
  return (
    <label className={`block ${wrapperClassName}`.trim()}>
      <span className="mb-2 block text-sm text-slate-300">{label}</span>
      <div className="relative">
        <input
          {...props}
          type="date"
          className={`date-input w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pr-12 outline-none focus:border-cyan-400 ${className}`.trim()}
        />
        <CalendarIcon />
      </div>
    </label>
  );
}
