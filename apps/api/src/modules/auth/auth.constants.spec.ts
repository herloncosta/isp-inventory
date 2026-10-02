import { describe, expect, it } from 'vitest';
import { requireJwtSecret } from './auth.constants.js';

describe('requireJwtSecret (S2)', () => {
  it('devolve o segredo quando existe', () => {
    expect(requireJwtSecret({ JWT_SECRET: 'segredo-de-producao' })).toBe('segredo-de-producao');
  });

  it('derruba o boot quando falta — nunca cai num fallback forjável', () => {
    expect(() => requireJwtSecret({})).toThrow(/JWT_SECRET não definido/);
    expect(() => requireJwtSecret({ JWT_SECRET: '' })).toThrow(/JWT_SECRET não definido/);
  });
});
