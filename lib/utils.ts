import { clsx } from 'clsx';

export function cn(...values: Array<string | false | null | undefined>) {
  return clsx(values);
}

export function formatCurrency(value: number) {
  return `$${value.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function toNumber(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function serializeDecimal(value: { toNumber(): number } | number | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  return typeof value === 'number' ? value : value.toNumber();
}
