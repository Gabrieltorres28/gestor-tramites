import { Lote, Movimiento, EstadoVencimiento } from '@/types';

export function calcularDiasHastaVencimiento(fechaVencimiento: string): number {
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);
  const diferencia = vencimiento.getTime() - hoy.getTime();
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
}

export function obtenerEstadoVencimiento(fechaVencimiento: string): EstadoVencimiento {
  const dias = calcularDiasHastaVencimiento(fechaVencimiento);

  if (dias < 0) return 'vencido';
  if (dias <= 60) return 'proximo';
  return 'ok';
}

export function calcularStockTotal(medicamentoId: string, lotes: Lote[]): number {
  return lotes
    .filter((l) => l.medicamentoId === medicamentoId)
    .reduce((sum, l) => sum + l.cantidadDisponible, 0);
}

export function encontrarProximoVencimiento(medicamentoId: string, lotes: Lote[]): string | null {
  const lotesDelMedicamento = lotes.filter((l) => l.medicamentoId === medicamentoId);

  if (lotesDelMedicamento.length === 0) return null;

  const loteProximo = lotesDelMedicamento.reduce((min, lote) => {
    return new Date(lote.fechaVencimiento) < new Date(min.fechaVencimiento) ? lote : min;
  });

  return loteProximo.fechaVencimiento;
}

export function contarMedicamentosPorVencer(lotes: Lote[]): number {
  const lotesUnicos = new Set();

  lotes.forEach((lote) => {
    const estado = obtenerEstadoVencimiento(lote.fechaVencimiento);
    if (estado === 'proximo') {
      lotesUnicos.add(lote.medicamentoId);
    }
  });

  return lotesUnicos.size;
}

export function contarMedicamentosVencidos(lotes: Lote[]): number {
  const lotesUnicos = new Set();

  lotes.forEach((lote) => {
    const estado = obtenerEstadoVencimiento(lote.fechaVencimiento);
    if (estado === 'vencido') {
      lotesUnicos.add(lote.medicamentoId);
    }
  });

  return lotesUnicos.size;
}

export function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function procesarVenta(
  medicamentoId: string,
  cantidad: number,
  lotes: Lote[]
): { exito: boolean; lotesActualizados: Lote[]; mensaje: string } {
  const lotesDelMedicamento = lotes
    .filter((l) => l.medicamentoId === medicamentoId)
    .sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime());

  const stockTotal = lotesDelMedicamento.reduce((sum, l) => sum + l.cantidadDisponible, 0);

  if (stockTotal < cantidad) {
    return {
      exito: false,
      lotesActualizados: lotes,
      mensaje: `Stock insuficiente. Disponible: ${stockTotal}, Solicitado: ${cantidad}`,
    };
  }

  let cantidadRestante = cantidad;
  const lotesActualizados = [...lotes];

  for (const lote of lotesDelMedicamento) {
    if (cantidadRestante <= 0) break;

    const indice = lotesActualizados.findIndex((l) => l.id === lote.id);
    const cantidadADescontar = Math.min(lote.cantidadDisponible, cantidadRestante);

    lotesActualizados[indice] = {
      ...lotesActualizados[indice],
      cantidadDisponible: lotesActualizados[indice].cantidadDisponible - cantidadADescontar,
    };

    cantidadRestante -= cantidadADescontar;
  }

  return {
    exito: true,
    lotesActualizados,
    mensaje: `Venta procesada correctamente. ${cantidad} unidades descontadas.`,
  };
}

export function generarDatosGraficoFinanciero(movimientos: Movimiento[]) {
  const movimientosValidos = movimientos.filter((movimiento) => movimiento.fecha);

  if (movimientosValidos.length === 0) {
    return [];
  }

  const agrupados = movimientosValidos.reduce<Record<string, { mes: string; ingresos: number; egresos: number; ganancia: number }>>((acc, movimiento) => {
    const fecha = new Date(movimiento.fecha);
    const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
    const mes = fecha.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });

    if (!acc[key]) {
      acc[key] = {
        mes,
        ingresos: 0,
        egresos: 0,
        ganancia: 0,
      };
    }

    if (movimiento.monto >= 0) {
      acc[key].ingresos += movimiento.monto;
      acc[key].ganancia += movimiento.monto;
    } else {
      acc[key].egresos += Math.abs(movimiento.monto);
      acc[key].ganancia -= Math.abs(movimiento.monto);
    }

    return acc;
  }, {});

  return Object.entries(agrupados)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([, value]) => value);
}
