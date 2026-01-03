
export interface ProductionEntry {
  id: string;
  date: string;
  seamstress: string;
  product: string;
  quantity: number;
  unitValue: number;
  total: number;
}

// Added SalesEntry interface to fix the module export error in SalesTable.tsx
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
}

export type AppTab = 'dashboard' | 'production' | 'catalog' | 'insights';
