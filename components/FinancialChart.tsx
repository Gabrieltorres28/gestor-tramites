'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-2">
            {payload[0].payload.mes}
          </p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: ${entry.value.toLocaleString('es-AR')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="mes"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
            iconType="rect"
          />
          <Bar
            dataKey="ingresos"
            fill="#10b981"
            name="Ingresos"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="egresos"
            fill="#ef4444"
            name="Egresos"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="ganancia"
            fill="#0284c7"
            name="Ganancia Neta"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Resumen */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Total Ingresos</p>
          <p className="text-lg font-semibold text-green-600">
            ${data.reduce((sum, d) => sum + d.ingresos, 0).toLocaleString('es-AR')}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Total Egresos</p>
          <p className="text-lg font-semibold text-red-600">
            ${data.reduce((sum, d) => sum + d.egresos, 0).toLocaleString('es-AR')}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Ganancia Neta</p>
          <p className="text-lg font-semibold text-primary-600">
            ${data.reduce((sum, d) => sum + d.ganancia, 0).toLocaleString('es-AR')}
          </p>
        </div>
      </div>
    </div>
  );
}
