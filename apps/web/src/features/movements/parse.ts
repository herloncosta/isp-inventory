/** "SN001, SN002" ou linhas soltas -> lista de seriais. */
export function parseSerials(raw: string): string[] {
  return raw
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Uma linha por equipamento: "SERIAL" ou "SERIAL,MAC". */
export function parseBatch(raw: string): { serialNumber: string; macAddress?: string }[] {
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [serialNumber, macAddress] = line.split(',').map((s) => s.trim());
      return macAddress ? { serialNumber, macAddress } : { serialNumber };
    });
}

export function horaAgora(): string {
  return new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
