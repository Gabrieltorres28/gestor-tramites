'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { appDataInicial } from '@/data/mockData';
import {
  AppData,
  AppSettings,
  Cliente,
  EstadoTramite,
  Lote,
  MedioPago,
  Medicamento,
  Movimiento,
  TipoMovimiento,
  TipoTramite,
  Tramite,
} from '@/types';

const STORAGE_KEY = 'gestor-tramites-data-v2';
const SESSION_KEY = 'gestor-tramites-session-v2';
const LEGACY_STORAGE_KEYS = ['gestor-tramites-data-v1', 'gestor-tramites-session-v1'];

interface LoginResult {
  ok: boolean;
  message?: string;
}

interface NuevoClienteInput {
  nombre: string;
  dni: string;
  tipoTramite: TipoTramite;
  porcentajeComision: number;
  telefono?: string;
  email?: string;
  notas?: string;
}

interface NuevoTramiteInput {
  clienteId: string;
  tipo: TipoTramite;
  montoGestionado: number;
  porcentajeComision: number;
  estado: EstadoTramite;
  fechaInicio: string;
  descripcion?: string;
}

interface NuevoMovimientoInput {
  fecha: string;
  tipo: TipoMovimiento;
  monto: number;
  medioPago: MedioPago;
  descripcion: string;
  tramiteId?: string;
}

interface NuevoMedicamentoInput {
  nombre: string;
  proveedor: string;
  precioCompra: number;
  precioVenta: number;
}

interface NuevoLoteInput {
  medicamentoId: string;
  numeroLote: string;
  fechaVencimiento: string;
  cantidadDisponible: number;
}

interface AppContextValue {
  data: AppData;
  isReady: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => LoginResult;
  logout: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addCliente: (input: NuevoClienteInput) => Cliente;
  deleteCliente: (clienteId: string) => void;
  addTramite: (input: NuevoTramiteInput) => Tramite;
  updateTramiteEstado: (tramiteId: string, estado: EstadoTramite) => void;
  deleteTramite: (tramiteId: string) => void;
  addMovimiento: (input: NuevoMovimientoInput) => Movimiento;
  deleteMovimiento: (movimientoId: string) => void;
  addMedicamento: (input: NuevoMedicamentoInput) => Medicamento;
  deleteMedicamento: (medicamentoId: string) => void;
  addLote: (input: NuevoLoteInput) => Lote;
  deleteLote: (loteId: string) => void;
  updateLotes: (lotes: Lote[]) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function createId(prefix: string) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function createCommissionMovement(tramite: Tramite): Movimiento {
  return {
    id: createId('M'),
    fecha: tramite.fechaFin || getToday(),
    tipo: 'Ingreso comisión',
    monto: tramite.comisionCalculada,
    medioPago: 'Transferencia',
    descripcion: `Comisión por trámite ${tramite.id} - ${tramite.clienteNombre}`,
    tramiteId: tramite.id,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(appDataInicial);
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    LEGACY_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));

    const savedData = window.localStorage.getItem(STORAGE_KEY);
    const savedSession = window.localStorage.getItem(SESSION_KEY);

    if (savedData) {
      try {
        setData(JSON.parse(savedData) as AppData);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    setIsAuthenticated(savedSession === 'true');
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, isReady]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(SESSION_KEY, isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated, isReady]);

  const login = (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const expectedEmail = data.settings.loginEmail.trim().toLowerCase();

    if (normalizedEmail === expectedEmail && password === data.settings.loginPassword) {
      setIsAuthenticated(true);
      return { ok: true };
    }

    return { ok: false, message: 'Credenciales inválidas.' };
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const updateSettings = (settings: Partial<AppSettings>) => {
    setData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        ...settings,
      },
    }));
  };

  const addCliente = (input: NuevoClienteInput) => {
    const cliente: Cliente = {
      id: createId('C'),
      nombre: input.nombre.trim(),
      dni: input.dni.trim(),
      tipoTramite: input.tipoTramite,
      porcentajeComision: input.porcentajeComision,
      estado: 'Activo',
      telefono: input.telefono?.trim() || '',
      email: input.email?.trim() || '',
      fechaAlta: getToday(),
      notas: input.notas?.trim() || '',
    };

    setData((current) => ({
      ...current,
      clientes: [cliente, ...current.clientes],
    }));

    return cliente;
  };

  const deleteCliente = (clienteId: string) => {
    setData((current) => {
      const tramiteIds = current.tramites
        .filter((tramite) => tramite.clienteId === clienteId)
        .map((tramite) => tramite.id);

      return {
        ...current,
        clientes: current.clientes.filter((cliente) => cliente.id !== clienteId),
        tramites: current.tramites.filter((tramite) => tramite.clienteId !== clienteId),
        movimientos: current.movimientos.filter((movimiento) => !movimiento.tramiteId || !tramiteIds.includes(movimiento.tramiteId)),
      };
    });
  };

  const addTramite = (input: NuevoTramiteInput) => {
    const cliente = data.clientes.find((item) => item.id === input.clienteId);
    const comisionCalculada = Math.round((input.montoGestionado * input.porcentajeComision) / 100);

    const tramite: Tramite = {
      id: createId('T').toUpperCase(),
      clienteId: input.clienteId,
      clienteNombre: cliente?.nombre || 'Cliente',
      tipo: input.tipo,
      montoGestionado: input.montoGestionado,
      porcentajeComision: input.porcentajeComision,
      comisionCalculada,
      estado: input.estado,
      fechaInicio: input.fechaInicio,
      fechaFin: input.estado === 'En proceso' ? undefined : getToday(),
      descripcion: input.descripcion?.trim() || '',
    };

    setData((current) => {
      const movimientos = [...current.movimientos];

      if (tramite.estado === 'Cobrado') {
        movimientos.unshift(createCommissionMovement(tramite));
      }

      return {
        ...current,
        tramites: [tramite, ...current.tramites],
        movimientos,
      };
    });

    return tramite;
  };

  const updateTramiteEstado = (tramiteId: string, estado: EstadoTramite) => {
    setData((current) => {
      const tramiteActual = current.tramites.find((item) => item.id === tramiteId);

      if (!tramiteActual || tramiteActual.estado === estado) {
        return current;
      }

      const tramiteActualizado: Tramite = {
        ...tramiteActual,
        estado,
        fechaFin: estado === 'En proceso' ? undefined : tramiteActual.fechaFin || getToday(),
      };

      const tramites = current.tramites.map((item) =>
        item.id === tramiteId ? tramiteActualizado : item
      );

      const yaTieneMovimiento = current.movimientos.some(
        (movimiento) => movimiento.tramiteId === tramiteId && movimiento.tipo === 'Ingreso comisión'
      );

      const movimientos = [...current.movimientos];

      if (estado === 'Cobrado' && !yaTieneMovimiento) {
        movimientos.unshift(createCommissionMovement(tramiteActualizado));
      }

      return {
        ...current,
        tramites,
        movimientos,
      };
    });
  };

  const deleteTramite = (tramiteId: string) => {
    setData((current) => ({
      ...current,
      tramites: current.tramites.filter((tramite) => tramite.id !== tramiteId),
      movimientos: current.movimientos.filter((movimiento) => movimiento.tramiteId !== tramiteId),
    }));
  };

  const addMovimiento = (input: NuevoMovimientoInput) => {
    const normalizedAmount = input.tipo === 'Ingreso comisión' || input.tipo === 'Ingreso cliente'
      ? Math.abs(input.monto)
      : -Math.abs(input.monto);

    const movimiento: Movimiento = {
      id: createId('M'),
      fecha: input.fecha,
      tipo: input.tipo,
      monto: normalizedAmount,
      medioPago: input.medioPago,
      descripcion: input.descripcion.trim(),
      tramiteId: input.tramiteId?.trim() || undefined,
    };

    setData((current) => ({
      ...current,
      movimientos: [movimiento, ...current.movimientos],
    }));

    return movimiento;
  };

  const deleteMovimiento = (movimientoId: string) => {
    setData((current) => ({
      ...current,
      movimientos: current.movimientos.filter((movimiento) => movimiento.id !== movimientoId),
    }));
  };

  const addMedicamento = (input: NuevoMedicamentoInput) => {
    const medicamento: Medicamento = {
      id: createId('MED').toUpperCase(),
      nombre: input.nombre.trim(),
      proveedor: input.proveedor.trim(),
      precioCompra: input.precioCompra,
      precioVenta: input.precioVenta,
    };

    setData((current) => ({
      ...current,
      medicamentos: [medicamento, ...current.medicamentos],
    }));

    return medicamento;
  };

  const deleteMedicamento = (medicamentoId: string) => {
    setData((current) => ({
      ...current,
      medicamentos: current.medicamentos.filter((medicamento) => medicamento.id !== medicamentoId),
      lotes: current.lotes.filter((lote) => lote.medicamentoId !== medicamentoId),
    }));
  };

  const addLote = (input: NuevoLoteInput) => {
    const lote: Lote = {
      id: createId('L').toUpperCase(),
      medicamentoId: input.medicamentoId,
      numeroLote: input.numeroLote.trim(),
      fechaVencimiento: input.fechaVencimiento,
      cantidadDisponible: input.cantidadDisponible,
    };

    setData((current) => ({
      ...current,
      lotes: [lote, ...current.lotes],
    }));

    return lote;
  };

  const deleteLote = (loteId: string) => {
    setData((current) => ({
      ...current,
      lotes: current.lotes.filter((lote) => lote.id !== loteId),
    }));
  };

  const updateLotes = (lotes: Lote[]) => {
    setData((current) => ({
      ...current,
      lotes,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        data,
        isReady,
        isAuthenticated,
        login,
        logout,
        updateSettings,
        addCliente,
        deleteCliente,
        addTramite,
        updateTramiteEstado,
        deleteTramite,
        addMovimiento,
        deleteMovimiento,
        addMedicamento,
        deleteMedicamento,
        addLote,
        deleteLote,
        updateLotes,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppData debe usarse dentro de AppProvider.');
  }

  return context;
}
