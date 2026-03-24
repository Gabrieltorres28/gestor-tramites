'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartDataPoint {
  mes: string;
  ingresos: number;
  egresos: number;
  ganancia: number;
}

interface FinancialChartProps {
  data: ChartDataPoint[];
  title: string;
}

export default function FinancialChart({ data, title }: FinancialChartProps) {
  const hasData = data.length > 0;

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-xl shadow-slate-950/20 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-slate-400">Evolución mensual de ingresos, egresos y resultado.</p>
        </div>
      </div>

      {hasData ? (
        <>
          <div className="h-72 w-full sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.18)" />
                <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                  contentStyle={{
                    background: '#020617',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '1rem',
                    color: '#e2e8f0',
                  }}
                  formatter={(value: number, name: string) => [`$${value.toLocaleString('es-AR')}`, name]}
                />
                <Bar dataKey="ingresos" fill="#34d399" radius={[10, 10, 0, 0]} name="Ingresos" />
                <Bar dataKey="egresos" fill="#fb7185" radius={[10, 10, 0, 0]} name="Egresos" />
                <Bar dataKey="ganancia" fill="#22d3ee" radius={[10, 10, 0, 0]} name="Resultado" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Ingresos</p>
              <p className="mt-2 text-xl font-semibold text-white">
                ${data.reduce((sum, item) => sum + item.ingresos, 0).toLocaleString('es-AR')}
              </p>
            </div>
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-rose-200">Egresos</p>
              <p className="mt-2 text-xl font-semibold text-white">
                ${data.reduce((sum, item) => sum + item.egresos, 0).toLocaleString('es-AR')}
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Resultado</p>
              <p className="mt-2 text-xl font-semibold text-white">
                ${data.reduce((sum, item) => sum + item.ganancia, 0).toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">
          Todavía no hay movimientos registrados. Cuando empieces a operar, acá vas a ver la evolución del negocio.
        </div>
      )}
    </div>
  );
}
