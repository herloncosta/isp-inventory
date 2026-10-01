import { useSyncExternalStore } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import {
  clearSession,
  getSession,
  setSession,
  subscribeSession,
  type AuthUser,
} from '../lib/auth-store';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export function useAuth() {
  const session = useSyncExternalStore(subscribeSession, getSession);
  const queryClient = useQueryClient();
  return {
    token: session?.accessToken ?? null,
    user: session?.user ?? null,
    logout: async () => {
      const current = getSession();
      try {
        await apiFetch('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: current?.refreshToken }),
        });
      } catch {
        return;
      } finally {
        clearSession();
        queryClient.clear();
        window.location.href = '/login';
      }
    },
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });
      queryClient.setQueryData(['user'], data.user);
    },
  });
}
