export enum Role {
  ADMIN = 'ADMIN',
  ESTOQUISTA = 'ESTOQUISTA',
  TECNICO = 'TECNICO',
}

export enum ProductCategory {
  ATIVO = 'ATIVO',
  PASSIVO = 'PASSIVO',
  FERRAMENTA = 'FERRAMENTA',
}

export enum Technology {
  FIBRA = 'FIBRA',
  UTP = 'UTP',
  RADIO = 'RADIO',
}

export enum Unit {
  UNIDADE = 'UNIDADE',
  METRO = 'METRO',
  CAIXA = 'CAIXA',
  PAR = 'PAR',
}

export enum LocationType {
  CENTRAL = 'CENTRAL',
  VEHICLE = 'VEHICLE',
}

export enum SerialStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  DEFECTIVE = 'DEFECTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export enum MovementType {
  ENTRADA = 'ENTRADA',
  TRANSFERENCIA = 'TRANSFERENCIA',
  BAIXA_OS = 'BAIXA_OS',
  DEVOLUCAO = 'DEVOLUCAO',
}
