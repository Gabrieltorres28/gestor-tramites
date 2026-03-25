'use client';

import { ProcedureStatus, ProcedureType } from '@prisma/client';
import { useEffect, useState } from 'react';
import { procedureTypeDescriptions, procedureTypeLabels } from '@/lib/types/app';
import SubmitButton from '@/components/ui/SubmitButton';
import DateField from '@/components/ui/DateField';
import { todayIso } from '@/lib/utils';

type ClientOption = {
  id: string;
  fullName: string;
  procedureType: ProcedureType;
  commissionRate: number;
};

type NewProcedureFormProps = {
  clients: ClientOption[];
  action: (formData: FormData) => void | Promise<void>;
};

export default function NewProcedureForm({ clients, action }: NewProcedureFormProps) {
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id ?? '');

  useEffect(() => {
    if (!clients.some((client) => client.id === selectedClientId)) {
      setSelectedClientId(clients[0]?.id ?? '');
    }
  }, [clients, selectedClientId]);

  const selectedClient = clients.find((client) => client.id === selectedClientId) ?? clients[0] ?? null;
  const selectedProcedureType = selectedClient?.procedureType ?? ProcedureType.RETIREMENT;
  const selectedCommissionRate = selectedClient?.commissionRate ?? 15;

  return (
    <form action={action} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Nuevo trámite</h2>
          <p className="mt-1 text-sm text-slate-400">Elegí el cliente y el sistema completa el tipo de gestión que ya definiste en clientes.</p>
        </div>
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
          Paso 1
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm text-slate-300">Cliente</span>
          <select
            name="clientId"
            value={selectedClientId}
            onChange={(event) => setSelectedClientId(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400"
          >
            {clients.map((client) => (
              <option key={client.id} value={client.id} className="bg-slate-900">
                {client.fullName}
              </option>
            ))}
          </select>
        </label>

        <input type="hidden" name="type" value={selectedProcedureType} />
        <input type="hidden" name="status" value={ProcedureStatus.IN_PROGRESS} />

        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 sm:col-span-2">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Tipo vinculado</p>
          <p className="mt-2 text-lg font-semibold text-white">{procedureTypeLabels[selectedProcedureType]}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">{procedureTypeDescriptions[selectedProcedureType]}</p>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Monto gestionado</span>
          <input type="number" name="amountManaged" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Comisión %</span>
          <input
            key={selectedClientId}
            type="number"
            name="commissionRate"
            defaultValue={selectedCommissionRate}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400"
          />
        </label>

        <DateField label="Fecha de inicio" name="startedAt" defaultValue={todayIso()} wrapperClassName="sm:col-span-2" />

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm text-slate-300">Resumen del trámite</span>
          <textarea
            name="description"
            rows={4}
            placeholder="Ej. documentación recibida, próxima gestión o aclaraciones importantes."
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400"
          />
        </label>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
        El trámite se crea <span className="font-medium text-white">en proceso</span>. Después podés marcarlo como finalizado o cobrado sin volver a cargar datos.
      </div>

      <SubmitButton pendingText="Guardando trámite..." className="mt-5 w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
        Crear trámite
      </SubmitButton>
    </form>
  );
}
