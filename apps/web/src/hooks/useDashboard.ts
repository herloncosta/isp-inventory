import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

interface DashboardSummary {
  totalProducts: number;
  totalLocations: number;
  totalMovements: number;
  lowStockCount: number;
  lowStock: Array<{
    id: string;
    quantity: number;
    product: { id: string; name: string; minStock: number; unit: string };
  }>;
  recentMovements: Array<{
    id: string;
    quantity: number;
    type: string;
    osNumber: string | null;
    createdAt: string;
    product: { id: string; name: string };
  }>;
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiFetch<DashboardSummary>('/dashboard'),
  });
}
