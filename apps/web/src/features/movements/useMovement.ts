import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';

/** Lança uma movimentação e invalida tudo que ela muda: saldo, histórico e painel. */
export function useMovement(path: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<unknown>(path, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-balances'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
