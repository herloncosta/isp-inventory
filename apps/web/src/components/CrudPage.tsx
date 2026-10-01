import { useState } from 'react';
import { useCreate, useList } from '../hooks/useCrud';
import RemoteSelect from './RemoteSelect';

export interface Column {
  key: string;
  label: string;
  /** algarismo tabular para dado medido ou identificador (SKU, CNPJ, placa) */
  num?: boolean;
  /** rótulos amigáveis para valores de enum (ex.: CATEGORY_LABELS) */
  values?: Record<string, string>;
}

export interface Field extends Omit<Column, 'values'> {
  type: 'text' | 'number' | 'select';
  options?: string[];
  values?: Record<string, string>;
  required?: boolean;
  hint?: string;
  /** popula o select a partir de um endpoint existente, em vez de pedir UUID colado */
  optionsFrom?: { queryKey: string; endpoint: string };
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

function display(value: unknown, values?: Record<string, string>): string {
  if (value === null || value === undefined || value === '') return '—';
  const raw = String(value);
  return values?.[raw] ?? raw;
}

export default function CrudPage({ title, queryKey, endpoint, columns, fields }: CrudPageProps) {
  const { data, isLoading, error } = useList<Record<string, unknown>>(queryKey, endpoint);
  const create = useCreate(queryKey, endpoint);
  const [form, setForm] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

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
        setSaved(true);
      },
    });
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="rule-b flex flex-wrap items-end justify-between gap-3 pb-3">
        <h1 className="text-lg font-bold uppercase tracking-[0.16em] text-ink">{title}</h1>
        <button
          onClick={() => {
            setOpen((v) => !v);
            setSaved(false);
          }}
          className="stamp-ghost"
          aria-expanded={open}
        >
          {open ? 'Fechar' : 'Novo registro'}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="label">{f.label}</label>
              {f.type === 'select' ? (
                f.optionsFrom ? (
                  <RemoteSelect
                    source={f.optionsFrom}
                    value={form[f.key] ?? ''}
                    onChange={(v) => setForm({ ...form, [f.key]: v })}
                    required={f.required}
                  />
                ) : (
                  <select
                    value={form[f.key] ?? ''}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    required={f.required}
                    className="field"
                  >
                    <option value="">Selecione</option>
                    {f.options?.map((o) => (
                      <option key={o} value={o}>
                        {f.values?.[o] ?? o}
                      </option>
                    ))}
                  </select>
                )
              ) : (
                <input
                  type={f.type}
                  value={form[f.key] ?? ''}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  required={f.required}
                  className="field"
                />
              )}
              {f.hint && <p className="mt-1 text-[11px] leading-snug text-ink-45">{f.hint}</p>}
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-4 sm:col-span-2 lg:col-span-3">
            <button type="submit" disabled={create.isPending} className="stamp">
              {create.isPending ? 'Salvando...' : 'Registrar'}
            </button>
            {create.isError && (
              <p className="border-l-2 border-red-carbon pl-3 text-sm text-red-carbon">
                {create.error?.message} Confira os campos e tente de novo.
              </p>
            )}
          </div>
        </form>
      )}

      {saved && (
        <p className="mt-4 text-sm text-carbon">
          Registro salvo. A via do novo item já consta no histórico de movimentações.
        </p>
      )}

      <div className="perf mt-6" />

      {isLoading ? (
        <p className="py-6 text-sm text-ink-70">Carregando...</p>
      ) : error ? (
        <p className="border-l-2 border-red-carbon py-2 pl-3 text-sm text-red-carbon">
          {(error as Error).message} Recarregue a página para tentar de novo.
        </p>
      ) : !data || data.length === 0 ? (
        <p className="py-8 text-sm text-ink-70">
          Nenhum registro em {title} ainda. Use “Novo registro” para o primeiro.
        </p>
      ) : (
        <div className="ledger-wrap">
          <table className="ledger">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={String(row.id)}>
                  {columns.map((c) => (
                    <td key={c.key} className={c.num ? 'num' : undefined}>
                      {display(get(row, c.key), c.values)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
