import { ClientStatus, ProcedureStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/utils';
import { getCashMovements } from '@/lib/data/cash';
import { getMedicines } from '@/lib/data/medicines';
import { getProcedures } from '@/lib/data/procedures';

export async function getDashboardData(businessId: string) {
  const [clientsCount, activeClientsCount, procedures, movements, medicines, settings] = await Promise.all([
    db.client.count({ where: { businessId } }),
    db.client.count({ where: { businessId, status: ClientStatus.ACTIVE } }),
    getProcedures(businessId),
    getCashMovements(businessId),
    getMedicines(businessId),
    db.businessSettings.findUnique({ where: { id: businessId } }),
  ]);

  const cajaActual = movements.reduce((sum, movement) => sum + movement.amount, 0);
  const comisiones = procedures.reduce((sum, procedure) => sum + procedure.commissionAmount, 0);
  const tramitesActivos = procedures.filter((procedure) => procedure.status === 'En proceso').length;
  const gananciaMensual = movements.filter((movement) => movement.type === 'Ingreso comisión').reduce((sum, movement) => sum + movement.amount, 0);
  const medicamentosPorVencer = medicines.filter((medicine) => medicine.expirationStatus === 'proximo').length;
  const medicamentosVencidos = medicines.filter((medicine) => medicine.expirationStatus === 'vencido').length;
  const recentTramites = procedures.slice(0, 4);

  const chartByMonth = new Map<string, { mes: string; ingresos: number; egresos: number; ganancia: number }>();

  movements.forEach((movement) => {
    const date = new Date(movement.movementDate.split('/').reverse().join('-'));
    const key = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
    const mes = date.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
    const item = chartByMonth.get(key) || { mes, ingresos: 0, egresos: 0, ganancia: 0 };

    if (movement.amount >= 0) {
      item.ingresos += movement.amount;
      item.ganancia += movement.amount;
    } else {
      item.egresos += Math.abs(movement.amount);
      item.ganancia -= Math.abs(movement.amount);
    }

    chartByMonth.set(key, item);
  });

  return {
    settings: settings
      ? {
          businessName: settings.businessName,
          ownerName: settings.ownerName,
          defaultCommissionRate: serializeDecimal(settings.defaultCommissionRate),
        }
      : {
          businessName: 'Gestor previsional',
          ownerName: 'Administrador',
          defaultCommissionRate: 15,
        },
    metrics: {
      clientsCount,
      activeClientsCount,
      proceduresCount: procedures.length,
      cajaActual,
      comisiones,
      tramitesActivos,
      gananciaMensual,
      medicamentosPorVencer,
      medicamentosVencidos,
    },
    chartData: Array.from(chartByMonth.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([, value]) => value),
    recentTramites,
  };
}
