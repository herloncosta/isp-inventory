import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Role, ROLE_LABELS } from '@isp/shared';
import { apiFetch } from '../../lib/api';
import type { UserRow } from './UserStatus';
import ErrorNote from '../form/ErrorNote';
import SelectField from '../form/SelectField';
import StampSubmit from '../form/StampSubmit';
import TextField from '../form/TextField';
import Modal from '../Modal';

interface UserFormModalProps {
  /** ausente = criação; presente = edição */
  user?: UserRow;
  onClose: () => void;
}

const EMPTY = { name: '', email: '', password: '', role: Role.ESTOQUISTA as string };

/**
 * Criar e editar usuário no mesmo formulário. A senha só aparece na edição
 * quando é digitada: campo vazio não pode apagar o hash existente.
 */
export default function UserFormModal({ user, onClose }: UserFormModalProps) {
  const editing = Boolean(user);
  const [form, setForm] = useState(
    user ? { name: user.name, email: user.email, password: '', role: user.role } : EMPTY,
  );
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      editing
        ? apiFetch<unknown>(`/users/${user!.id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
          })
        : apiFetch<unknown>('/users', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const set = (key: keyof typeof EMPTY) => (v: string) => setForm({ ...form, [key]: v });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, unknown> = {
      name: form.name,
      email: form.email,
      role: form.role,
    };
    if (form.password.trim()) data.password = form.password;
    mutation.mutate(data, { onSuccess: onClose });
  };

  return (
    <Modal open title={editing ? `Editar ${user!.name}` : 'Novo usuário'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        <TextField label="Nome" value={form.name} onChange={set('name')} required />
        <TextField
          label="E-mail"
          type="email"
          value={form.email}
          onChange={set('email')}
          placeholder="nome@isp.com"
          required
        />
        <TextField
          label={editing ? 'Nova senha (opcional)' : 'Senha'}
          hint={editing ? 'Deixe em branco para manter a senha atual.' : 'Mínimo de 6 caracteres.'}
          type="password"
          value={form.password}
          onChange={set('password')}
          placeholder={editing ? 'deixe em branco' : '••••••••'}
          required={!editing}
        />
        <SelectField
          label="Perfil"
          value={form.role}
          onChange={set('role')}
          options={Object.values(Role).map((r) => ({ id: r, name: ROLE_LABELS[r] }))}
          required
        />

        <ErrorNote error={mutation.error as Error | null} recovery="" />
        <StampSubmit pending={mutation.isPending}>
          {editing ? 'Salvar alterações' : 'Criar usuário'}
        </StampSubmit>
      </form>
    </Modal>
  );
}
