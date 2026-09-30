import {
  Role,
  ProductCategory,
  Technology,
  Unit,
  LocationType,
  SerialStatus,
  MovementType,
} from '../enums/index.js';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  technology: Technology;
  unit: Unit;
  minStock: number;
}

export interface StockLocation {
  id: string;
  name: string;
  type: LocationType;
  responsibleUserId: string | null;
}

export interface StockBalance {
  id: string;
  locationId: string;
  productId: string;
  quantity: number;
}

export interface StockMovement {
  id: string;
  sourceLocationId: string | null;
  targetLocationId: string | null;
  productId: string;
  quantity: number;
  osNumber: string | null;
  type: MovementType;
  createdBy: string;
  createdAt: Date;
}

export interface SerialItem {
  id: string;
  productId: string;
  serialNumber: string;
  macAddress: string | null;
  currentLocationId: string;
  status: SerialStatus;
}

export interface Supplier {
  id: string;
  cnpj: string;
  razaoSocial: string;
  contato: string;
}

export interface Technician {
  id: string;
  name: string;
  userId: string;
  vehicleId: string | null;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
}
