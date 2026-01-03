
import React, { useState, useMemo, useEffect } from 'react';
import { AppTab, ProductionEntry, ProductCatalog } from './types';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import ProductionTable from './components/ProductionTable';
import Insights from './components/Insights';
import Catalog from './components/Catalog';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  
  // Inicializa o catálogo com tratamento de erro
  const [catalog, setCatalog] = useState<ProductCatalog[]>(() => {
    try {
      const saved = localStorage.getItem('sewmaster_catalog');
      return saved ? JSON.parse(saved) : [
        { id: 'c1', name: 'Mochila', productionPrice: 3.00 },
        { id: 'c2', name: 'Mini Mala', productionPrice: 3.50 },
        { id: 'c3', name: 'Estojo', productionPrice: 1.50 },
      ];
    } catch (e) {
      return [];
    }
  });

  // Inicializa a produção com tratamento de erro
  const [production, setProduction] = useState<ProductionEntry[]>(() => {
    try {
      const saved = localStorage.getItem('sewmaster_production');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Salva dados sempre que alterados
  useEffect(() => {
    localStorage.setItem('sewmaster_catalog', JSON.stringify(catalog));
  }, [catalog]);

  useEffect(() => {
    localStorage.setItem('sewmaster_production', JSON.stringify(production));
  }, [production]);

  const financialSummary = useMemo(() => {
    const totalProductionCost = production.reduce((acc, curr) => acc + curr.total, 0);
    const totalPieces = production.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    const seamstressCount = new Set(production.map(p => p.seamstress)).size;
    
    return {
      totalProductionCost,
      totalPieces,
      seamstressCount
    };
  }, [production]);

  const addCatalog = (product: Omit<ProductCatalog, 'id'>) => {
    setCatalog(prev => [...prev, { ...product, id: Date.now().toString() }]);
  };

  const deleteCatalog = (id: string) => {
    if(confirm("Excluir este item do catálogo?")) {
      setCatalog(prev => prev.filter(p => p.id !== id));
    }
  };

  const addProduction = (entry: Omit<ProductionEntry, 'id' | 'total'>) => {
    const newEntry: ProductionEntry = {
      ...entry,
      id: Date.now().toString(),
      total: entry.quantity * entry.unitValue
    };
    setProduction(prev => [newEntry, ...prev]);
  };

  const deleteProduction = (id: string) => {
    if(confirm("Excluir este registro de produção?")) {
      setProduction(prev => prev.filter(e => e.id !== id));
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden h-screen">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto no-scrollbar pb-24 md:pb-8">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-serif text-slate-900">
            {activeTab === 'dashboard' && 'Resumo de Pagamentos'}
            {activeTab === 'production' && 'Lançamento de Produção'}
            {activeTab === 'catalog' && 'Catálogo de Preços'}
            {activeTab === 'insights' && 'Análise de Produtividade'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {activeTab === 'dashboard' && 'Veja quanto deve ser pago para cada costureiro(a).'}
            {activeTab === 'production' && 'Registre as peças produzidas no dia.'}
            {activeTab === 'catalog' && 'Defina os valores pagos por tipo de peça.'}
            {activeTab === 'insights' && 'IA analisando custos e eficiência da equipe.'}
          </p>
        </header>

        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard summary={financialSummary} production={production} />
          )}

          {activeTab === 'production' && (
            <ProductionTable 
              data={production} 
              catalog={catalog}
              onAdd={addProduction} 
              onDelete={deleteProduction} 
            />
          )}

          {activeTab === 'catalog' && (
            <Catalog 
              products={catalog}
              onAdd={addCatalog}
              onDelete={deleteCatalog}
            />
          )}

          {activeTab === 'insights' && (
            <Insights production={production} summary={financialSummary} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
