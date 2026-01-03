
export interface ProductionEntry {
  id: string;
  date: string;
  seamstress: string;
  product: string;
  quantity: number;
  unitValue: number;
  total: number;
  status: 'pago' | 'pendente';
}

export interface SalesEntry {
  id: string;
  date: string;
  product: string;
  quantity: number;
  salePrice: number;
  total: number;
}

export interface ProductCatalog {
  id: string;
  name: string;
  productionPrice: number;
}

export interface FinancialSummary {
  totalProductionCost: number;
  totalPieces: number;
  seamstressCount: number;
  totalPending: number;
  totalPaid: number;
}

export type AppTab = 'dashboard' | 'production' | 'catalog' | 'ranking';
