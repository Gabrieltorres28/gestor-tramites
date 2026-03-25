import type {
  CashMovementType,
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
};

export type ProcedureListItem = {
  id: string;
  clientId: string;
  clientName: string;
  type: string;
  status: string;
  statusKey: ProcedureStatus;
  amountManaged: number;
  commissionRate: number;
  commissionAmount: number;
  startedAt: string;
  completedAt?: string;
  description: string;
};

export type CashMovementListItem = {
  id: string;
  type: string;
  paymentMethod: string;
  description: string;
  amount: number;
  movementDate: string;
  procedureId?: string;
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

export const procedureTypeLabels: Record<ProcedureType, string> = {
  RETIREMENT: 'Jubilación',
  PENSION: 'Pensión',
  MEDICINES: 'Medicamentos',
  SUBSIDY: 'Subsidio',
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
