'use client';

import { ProcedureStatus, ProcedureType } from '@prisma/client';
import { useEffect, useState } from 'react';
import { procedureStatusLabels, procedureTypeLabels } from '@/lib/types/app';
import SubmitButton from '@/components/ui/SubmitButton';
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
      <h2 className="text-xl font-semibold text-white">Nuevo trámite</h2>
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

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Tipo</span>
          <select
            value={selectedProcedureType}
            disabled
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300 outline-none disabled:cursor-not-allowed disabled:opacity-100"
          >
            {Object.values(ProcedureType).map((type) => (
              <option key={type} value={type} className="bg-slate-900">
                {procedureTypeLabels[type]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Estado inicial</span>
          <select name="status" defaultValue={ProcedureStatus.IN_PROGRESS} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400">
            {Object.values(ProcedureStatus).map((status) => (
              <option key={status} value={status} className="bg-slate-900">
                {procedureStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Monto</span>
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

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm text-slate-300">Fecha de inicio</span>
          <input type="date" name="startedAt" defaultValue={todayIso()} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm text-slate-300">Descripción</span>
          <textarea name="description" rows={4} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-400" />
        </label>
      </div>
      <SubmitButton pendingText="Guardando trámite..." className="mt-5 w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
        Guardar trámite
      </SubmitButton>
    </form>
  );
}
