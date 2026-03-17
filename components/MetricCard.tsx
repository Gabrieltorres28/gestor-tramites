interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
}: MetricCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/20 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{value}</p>
          {subtitle ? <p className="mt-2 text-sm text-slate-400">{subtitle}</p> : null}
          {trend ? (
            <p className={`mt-3 text-sm font-medium ${trend.isPositive ? 'text-emerald-300' : 'text-rose-300'}`}>
              {trend.isPositive ? 'Sube' : 'Baja'} {trend.value}
            </p>
          ) : null}
        </div>
        {icon ? (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
