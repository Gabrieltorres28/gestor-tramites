import { Lote, Medicamento, EstadoVencimiento } from '@/types';

/**
 * Calcula los días restantes hasta el vencimiento
 */
export function calcularDiasHastaVencimiento(fechaVencimiento: string): number {
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);
  const diferencia = vencimiento.getTime() - hoy.getTime();
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
}

/**
 * Determina el estado de vencimiento de un lote
 */
export function obtenerEstadoVencimiento(fechaVencimiento: string): EstadoVencimiento {
  const dias = calcularDiasHastaVencimiento(fechaVencimiento);
  
  if (dias < 0) return 'vencido';
  if (dias <= 60) return 'proximo';
  return 'ok';
}

/**
 * Calcula el stock total de un medicamento sumando todos sus lotes
 */
export function calcularStockTotal(medicamentoId: string, lotes: Lote[]): number {
  return lotes
    .filter(l => l.medicamentoId === medicamentoId)
    .reduce((sum, l) => sum + l.cantidadDisponible, 0);
}

/**
 * Encuentra el lote con vencimiento más próximo para un medicamento
 */
export function encontrarProximoVencimiento(medicamentoId: string, lotes: Lote[]): string | null {
  const lotesDelMedicamento = lotes.filter(l => l.medicamentoId === medicamentoId);
  
  if (lotesDelMedicamento.length === 0) return null;
  
  const loteProximo = lotesDelMedicamento.reduce((min, lote) => {
    return new Date(lote.fechaVencimiento) < new Date(min.fechaVencimiento) ? lote : min;
  });
  
  return loteProximo.fechaVencimiento;
}

/**
 * Cuenta medicamentos que vencen en los próximos 60 días
 */
export function contarMedicamentosPorVencer(lotes: Lote[]): number {
  const lotesUnicos = new Set();
  
  lotes.forEach(lote => {
    const estado = obtenerEstadoVencimiento(lote.fechaVencimiento);
    if (estado === 'proximo') {
      lotesUnicos.add(lote.medicamentoId);
    }
  });
  
  return lotesUnicos.size;
}

/**
 * Cuenta medicamentos vencidos
 */
export function contarMedicamentosVencidos(lotes: Lote[]): number {
  const lotesUnicos = new Set();
  
  lotes.forEach(lote => {
    const estado = obtenerEstadoVencimiento(lote.fechaVencimiento);
    if (estado === 'vencido') {
      lotesUnicos.add(lote.medicamentoId);
    }
  });
  
  return lotesUnicos.size;
}

/**
 * Formatea fecha para display
 */
export function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Procesa venta usando FIFO por fecha de vencimiento
 */
export function procesarVenta(
  medicamentoId: string,
  cantidad: number,
  lotes: Lote[]
): { exito: boolean; lotesActualizados: Lote[]; mensaje: string } {
  const lotesDelMedicamento = lotes
    .filter(l => l.medicamentoId === medicamentoId)
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

    const indice = lotesActualizados.findIndex(l => l.id === lote.id);
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

/**
 * Genera datos para el gráfico de ingresos vs egresos
 */
export function generarDatosGraficoFinanciero(movimientos: any[]) {
  const meses = ['Ene', 'Feb'];
  const datos = [];

  // Simular enero
  const movimientosEnero = movimientos.filter(m => 
    new Date(m.fecha).getMonth() === 0
  );
  
  const ingresosEnero = movimientosEnero
    .filter(m => m.monto > 0)
    .reduce((sum, m) => sum + m.monto, 0);
  
  const egresosEnero = Math.abs(movimientosEnero
    .filter(m => m.monto < 0)
    .reduce((sum, m) => sum + m.monto, 0));

  datos.push({
    mes: 'Ene',
    ingresos: ingresosEnero || 145000,
    egresos: egresosEnero || 28000,
    ganancia: (ingresosEnero || 145000) - (egresosEnero || 28000),
  });

  // Febrero - datos reales
  const movimientosFebrero = movimientos.filter(m => 
    new Date(m.fecha).getMonth() === 1
  );
  
  const ingresosFebrero = movimientosFebrero
    .filter(m => m.monto > 0)
    .reduce((sum, m) => sum + m.monto, 0);
  
  const egresosFebrero = Math.abs(movimientosFebrero
    .filter(m => m.monto < 0)
    .reduce((sum, m) => sum + m.monto, 0));

  datos.push({
    mes: 'Feb',
    ingresos: ingresosFebrero,
    egresos: egresosFebrero,
    ganancia: ingresosFebrero - egresosFebrero,
  });

  return datos;
}
