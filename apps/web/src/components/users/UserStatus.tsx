import { ROLE_LABELS } from '@isp/shared';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  deactivatedAt: string | null;
}

interface UserStatusProps {
  user: UserRow;
}

/** Estado da conta: selo impresso com a palavra — ativo não é um check verde. */
export default function UserStatus({ user }: UserStatusProps) {
  if (user.active) {
    return (
      <span className="seal" data-on="true" data-tone="carbon">
        Ativo
      </span>
    );
  }

  const since = user.deactivatedAt
    ? new Date(user.deactivatedAt).toLocaleDateString('pt-BR')
    : null;

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="seal" data-on="true" data-tone="defeito">
        Desativado
      </span>
      {since && <span className="num text-[11px] text-ink-45">desde {since}</span>}
    </span>
  );
}

export type { UserRow };
