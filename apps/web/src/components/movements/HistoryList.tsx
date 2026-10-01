import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MOVEMENT_LABELS } from '@isp/shared';
import { apiFetch } from '../../lib/api';
import type { Movement } from '../../features/movements/types';
import type { Option } from '../../features/options';
import ErrorNote from '../form/ErrorNote';
import Field from '../form/Field';
import SelectField from '../form/SelectField';
import TextField from '../form/TextField';

interface HistoryListProps {
  products: Option[];
  locations: Option[];
}

/** O ledger de auditoria: toda movimentação registrada, com filtros. */
export default function HistoryList({ products, locations }: HistoryListProps) {
  const [type, setType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [productId, setProductId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [os, setOs] = useState('');

  const params = new URLSearchParams({
    ...(type ? { type } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
    ...(productId ? { productId } : {}),
    ...(locationId ? { locationId } : {}),
    ...(os.trim() ? { osNumber: os.trim() } : {}),
  });
  const qs = params.toString();

  const { data, isLoading, error } = useQuery({
    queryKey: ['movements', type, from, to, productId, locationId, os],
    queryFn: () => apiFetch<Movement[]>(`/stock/movements${qs ? `?${qs}` : ''}`),
  });

  return (
    <section>
      <h2 className="border-b border-ink pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink">
        Histórico de movimentações
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Tipo">
          <select value={type} onChange={(e) => setType(e.target.value)} className="field">
            <option value="">Todos</option>
            <option value="ENTRADA">Entrada</option>
            <option value="TRANSFERENCIA">Transferência</option>
            <option value="BAIXA_OS">Baixa em OS</option>
            <option value="DEVOLUCAO">Devolução</option>
          </select>
        </Field>
        <SelectField label="Produto" value={productId} onChange={setProductId} options={products} />
        <SelectField
          label="Local (origem ou destino)"
          value={locationId}
          onChange={setLocationId}
          options={locations}
        />
        <TextField label="OS / Cliente" value={os} onChange={setOs} placeholder="Filtrar por OS" />
        <Field label="De">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="field"
          />
        </Field>
        <Field label="Até">
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="field" />
        </Field>
      </div>

      <div className="perf mt-6" />

      {isLoading ? (
        <p className="py-6 text-sm text-ink-70">Carregando...</p>
      ) : error ? (
        <ErrorNote error={error as Error} />
      ) : !data || data.length === 0 ? (
        <p className="py-6 text-sm text-ink-70">Nenhuma movimentação com esses filtros.</p>
      ) : (
        <div className="ledger-wrap">
          <table className="ledger">
            <thead>
              <tr>
                <th>Quando</th>
                <th>Tipo</th>
                <th>Produto</th>
                <th className="text-right">Qtd</th>
                <th>OS</th>
              </tr>
            </thead>
            <tbody>
              {data.map((mv) => (
                <tr key={mv.id}>
                  <td className="num whitespace-nowrap text-ink-70">
                    {new Date(mv.createdAt).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="whitespace-nowrap">{MOVEMENT_LABELS[mv.type] ?? mv.type}</td>
                  <td>{mv.product.name}</td>
                  <td className="num text-right">{mv.quantity}</td>
                  <td className="num text-ink-70">{mv.osNumber ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
