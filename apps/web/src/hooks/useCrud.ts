import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export function useList<T>(key: string, path: string) {
  return useQuery({ queryKey: [key], queryFn: () => apiFetch<T[]>(path) });
}

export function useCreate(key: string, path: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<unknown>(path, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [key] }),
  });
}
