export type EstadoTramite = 'En proceso' | 'Finalizado' | 'Cobrado';
export type TipoTramite = 'Jubilación' | 'Pensión' | 'Medicamentos' | 'Subsidio' | 'Otro';
export type TipoMovimiento = 'Ingreso comisión' | 'Ingreso cliente' | 'Egreso' | 'Gasto';
export type MedioPago = 'Efectivo' | 'Transferencia' | 'Cheque' | 'Débito' | 'Crédito';

export interface Cliente {
  id: string;
  nombre: string;
  dni: string;
  tipoTramite: TipoTramite;
  porcentajeComision: number;
  estado: 'Activo' | 'Inactivo';
  telefono?: string;
  email?: string;
  fechaAlta: string;
  notas?: string;
}

export interface Tramite {
  id: string;
  clienteId: string;
  clienteNombre: string;
  tipo: TipoTramite;
  montoGestionado: number;
  porcentajeComision: number;
  comisionCalculada: number;
  estado: EstadoTramite;
  fechaInicio: string;
  fechaFin?: string;
  descripcion?: string;
}

export interface Movimiento {
  id: string;
  fecha: string;
  tipo: TipoMovimiento;
  monto: number;
  medioPago: MedioPago;
  descripcion: string;
  tramiteId?: string;
}

export interface DashboardMetrics {
  cajaActual: number;
  comisionesMes: number;
  tramitesActivos: number;
  gananciaMensual: number;
  medicamentosPorVencer: number;
  medicamentosVencidos: number;
}

export interface Medicamento {
  id: string;
  nombre: string;
  proveedor: string;
  precioCompra: number;
  precioVenta: number;
}

export interface Lote {
  id: string;
  medicamentoId: string;
  numeroLote: string;
  fechaVencimiento: string;
  cantidadDisponible: number;
}

export type EstadoVencimiento = 'ok' | 'proximo' | 'vencido';

export interface AppSettings {
  businessName: string;
  ownerName: string;
  loginEmail: string;
  loginPassword: string;
}

export interface AppData {
  settings: AppSettings;
  clientes: Cliente[];
  tramites: Tramite[];
  movimientos: Movimiento[];
  medicamentos: Medicamento[];
  lotes: Lote[];
}
