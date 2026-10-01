import { useState } from 'react';
import { horaAgora } from './parse';
import type { Via } from './types';

/**
 * A via impressa. O contador `stamp` alimenta a key do componente para que a
 * folha se imprima de novo a cada confirmação, e a hora é capturada no momento
 * do carimbo — nunca recalculada no render.
 */
export function useVia() {
  const [via, setVia] = useState<Via | null>(null);
  const [stamp, setStamp] = useState(0);

  return {
    via,
    stamp,
    print: (v: Omit<Via, 'quando'>) => {
      setVia({ ...v, quando: horaAgora() });
      setStamp((n) => n + 1);
    },
  };
}
