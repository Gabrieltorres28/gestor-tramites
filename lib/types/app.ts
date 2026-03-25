import type {
  CashMovementType,
  ClientAlertType,
  PaymentMethod,
  ProcedureStatus,
  ProcedureType,
  UserRole,
} from '@prisma/client';

export type DashboardChartPoint = {
  mes: string;
  ingresos: number;
  egresos: number;
  ganancia: number;
};

export type UserContext = {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  businessId: string;
  businessName: string;
  ownerName: string;
};

export type ClientListItem = {
  id: string;
  fullName: string;
  dni: string;
  phone: string;
  email: string;
  notes: string;
  status: 'Activo' | 'Inactivo';
  procedureType: string;
  commissionRate: number;
  createdAt: string;
  activeAlertsCount: number;
  nextAlertTitle: string;
  nextAlertDate: string;
  nextAlertStatus: 'active' | 'expiring' | 'expired' | 'resolved' | 'none';
  nextAlertStatusLabel: string;
};

export type ProcedureListItem = {
  id: string;
  clientId: string;
  clientName: string;
  type: string;
  typeKey: ProcedureType;
  status: string;
  statusKey: ProcedureStatus;
  amountManaged: number;
  commissionRate: number;
  commissionAmount: number;
  startedAt: string;
  completedAt?: string;
  description: string;
  cashRecorded: boolean;
};

export type CashMovementListItem = {
  id: string;
  type: string;
  paymentMethod: string;
  description: string;
  amount: number;
  movementDate: string;
  procedureId?: string;
  sourceLabel: 'Automático' | 'Manual';
};

export type MedicineBatchItem = {
  id: string;
  batchNumber: string;
  expirationDate: string;
  quantityAvailable: number;
};

export type MedicineListItem = {
  id: string;
  name: string;
  supplier: string;
  purchasePrice: number;
  salePrice: number;
  stockTotal: number;
  nextExpiration?: string;
  expirationStatus: 'ok' | 'proximo' | 'vencido';
  expirationDays?: number;
  prescriptionIssuedAt?: string;
  prescriptionDurationMonths?: number;
  prescriptionExpiresAt?: string;
  prescriptionStatus: 'none' | 'active' | 'expiring' | 'expired';
  prescriptionDaysRemaining?: number;
  batches: MedicineBatchItem[];
};

export type ClientAlertListItem = {
  id: string;
  clientId: string;
  clientName: string;
  clientProcedureType: ProcedureType;
  typeKey: ClientAlertType;
  typeLabel: string;
  title: string;
  notes: string;
  startsAt: string;
  expiresAt: string;
  createdAt: string;
  resolvedAt: string;
  status: 'active' | 'expiring' | 'expired' | 'resolved';
  statusLabel: string;
  daysRemaining: number | null;
};

export const procedureTypeLabels: Record<ProcedureType, string> = {
  RETIREMENT: 'Jubilación',
  PENSION: 'Pensión',
  MEDICINES: 'Medicamentos',
  SUBSIDY: 'Subsidio',
  OTHER: 'Otro',
};

export const procedureTypeDescriptions: Record<ProcedureType, string> = {
  RETIREMENT: 'Seguimiento previsional con foco en jubilación.',
  PENSION: 'Gestión de pensión con hitos claros para avanzar.',
  MEDICINES: 'Seguimiento del trámite vinculado a cobertura de medicamentos.',
  SUBSIDY: 'Trámite de subsidio con control de etapas y cobro.',
  OTHER: 'Gestión administrativa personalizada.',
};

export const clientAlertTypeLabels: Record<ClientAlertType, string> = {
  PRESCRIPTION: 'Receta',
  SUBSIDY: 'Subsidio',
  DOCUMENT: 'Documento',
  APPOINTMENT: 'Turno',
  OTHER: 'Otro',
};

export const procedureStatusLabels: Record<ProcedureStatus, string> = {
  IN_PROGRESS: 'En proceso',
  COMPLETED: 'Finalizado',
  PAID: 'Cobrado',
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: 'Efectivo',
  BANK_TRANSFER: 'Transferencia',
  CHECK: 'Cheque',
  DEBIT: 'Débito',
  CREDIT: 'Crédito',
};

export const cashMovementTypeLabels: Record<CashMovementType, string> = {
  COMMISSION_INCOME: 'Ingreso comisión',
  CLIENT_INCOME: 'Ingreso cliente',
  EXPENSE: 'Gasto',
  WITHDRAWAL: 'Egreso',
};

export const roleLabels: Record<UserRole, string> = {
  ADMIN: 'admin',
  OPERATOR: 'operador',
};
