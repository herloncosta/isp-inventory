import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export function useAuth() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return {
    token,
    user: user ? JSON.parse(user) : null,
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      queryClient.setQueryData(['user'], data.user);
    },
  });
}
