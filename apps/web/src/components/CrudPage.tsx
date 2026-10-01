import { useState } from 'react';
import { useCreate, useList } from '../hooks/useCrud';

export interface Column {
  key: string;
  label: string;
}

export interface Field extends Column {
  type: 'text' | 'number' | 'select';
  options?: string[];
  required?: boolean;
}

interface CrudPageProps {
  title: string;
  queryKey: string;
  endpoint: string;
  columns: Column[];
  fields: Field[];
}

function get(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (typeof acc !== 'object' || acc === null) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

export default function CrudPage({ title, queryKey, endpoint, columns, fields }: CrudPageProps) {
  const { data, isLoading } = useList<Record<string, unknown>>(queryKey, endpoint);
  const create = useCreate(queryKey, endpoint);
  const [form, setForm] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      const value = form[f.key]?.trim();
      if (!value) continue;
      payload[f.key] = f.type === 'number' ? Number(value) : value;
    }
    create.mutate(payload, {
      onSuccess: () => {
        setForm({});
        setOpen(false);
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {open ? 'Fechar' : 'Novo'}
          </button>
        </div>
        {open && (
          <form
            onSubmit={submit}
            className="p-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            {fields.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                {f.type === 'select' ? (
                  <select
                    value={form[f.key] ?? ''}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    required={f.required}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Selecione</option>
                    {f.options?.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type}
                    value={form[f.key] ?? ''}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    required={f.required}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                )}
              </div>
            ))}
            <div className="md:col-span-3">
              {create.isError && (
                <p className="text-sm text-red-600 mb-2">{create.error?.message}</p>
              )}
              <button
                type="submit"
                disabled={create.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {create.isPending ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        )}
        {isLoading ? (
          <p className="p-4 text-sm text-gray-500">Carregando...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                {columns.map((c) => (
                  <th key={c.key} className="px-4 py-2 font-medium">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.map((row) => (
                <tr key={String(row.id)} className="border-b border-gray-100">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-2">
                      {String(get(row, c.key) ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
