
import React, { useState, useMemo, useEffect } from 'react';
import { AppTab, ProductionEntry, ProductCatalog, FinancialSummary } from './types';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import ProductionTable from './components/ProductionTable';
import Ranking from './components/Ranking';
import Catalog from './components/Catalog';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [filterName, setFilterName] = useState('');
  
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

  const [production, setProduction] = useState<ProductionEntry[]>(() => {
    try {
      const saved = localStorage.getItem('sewmaster_production');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return parsed.map((item: any) => ({
        ...item,
        status: item.status || 'pendente'
      }));
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('sewmaster_catalog', JSON.stringify(catalog));
  }, [catalog]);

  useEffect(() => {
    localStorage.setItem('sewmaster_production', JSON.stringify(production));
  }, [production]);

  // Função para padronizar nomes (João Silva, Maria Souza, etc)
  const normalizeName = (name: string) => {
    return name
      .trim()
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const financialSummary = useMemo<FinancialSummary>(() => {
    const totalProductionCost = production.reduce((acc, curr) => acc + curr.total, 0);
    const totalPieces = production.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    // Consolida nomes únicos normalizados
    const seamstressCount = new Set(production.map(p => normalizeName(p.seamstress))).size;
    const totalPaid = production.filter(p => p.status === 'pago').reduce((acc, curr) => acc + curr.total, 0);
    const totalPending = production.filter(p => p.status === 'pendente').reduce((acc, curr) => acc + curr.total, 0);
    
    return {
      totalProductionCost,
      totalPieces,
      seamstressCount,
      totalPaid,
      totalPending
    };
  }, [production]);

  const addCatalog = (product: Omit<ProductCatalog, 'id'>) => {
    setCatalog(prev => [...prev, { ...product, id: Date.now().toString() }]);
  };

  const updateCatalog = (id: string, product: Omit<ProductCatalog, 'id'>) => {
    setCatalog(prev => prev.map(p => p.id === id ? { ...product, id } : p));
  };

  const deleteCatalog = (id: string) => {
    if(confirm("Excluir este item do catálogo?")) {
      setCatalog(prev => prev.filter(p => p.id !== id));
    }
  };

  const addProduction = (entry: Omit<ProductionEntry, 'id' | 'total' | 'status'>) => {
    const newEntry: ProductionEntry = {
      ...entry,
      id: Date.now().toString(),
      seamstress: normalizeName(entry.seamstress),
      total: entry.quantity * entry.unitValue,
      status: 'pendente'
    };
    setProduction(prev => [newEntry, ...prev]);
  };

  const updateProduction = (id: string, entry: Omit<ProductionEntry, 'id' | 'total'>) => {
    setProduction(prev => prev.map(e => e.id === id ? { 
      ...entry, 
      id, 
      seamstress: normalizeName(entry.seamstress),
      total: entry.quantity * entry.unitValue 
    } : e));
  };

  const togglePaymentStatus = (id: string) => {
    setProduction(prev => prev.map(e => 
      e.id === id ? { ...e, status: e.status === 'pago' ? 'pendente' : 'pago' } : e
    ));
  };

  const deleteProduction = (id: string) => {
    if(confirm("Excluir este registro de produção?")) {
      setProduction(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleGoToPrint = (name: string) => {
    setFilterName(name);
    setActiveTab('production');
    setTimeout(() => {
      window.print();
    }, 500); 
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden h-screen">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto no-scrollbar pb-24 md:pb-8">
        <header className="mb-6 no-print">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                {activeTab === 'dashboard' && 'Painel de Controle'}
                {activeTab === 'production' && 'Livro de Produção'}
                {activeTab === 'catalog' && 'Tabela de Preços'}
                {activeTab === 'ranking' && 'Ranking de Produtividade'}
              </h1>
              <p className="text-slate-400 text-xs font-medium mt-1 uppercase tracking-[0.2em]">
                {activeTab === 'dashboard' && 'Gestão financeira e pagamentos.'}
                {activeTab === 'production' && 'Controle de lotes e costura.'}
                {activeTab === 'catalog' && 'Mão de obra por produto.'}
                {activeTab === 'ranking' && 'Performance por colaborador.'}
              </p>
            </div>
            {activeTab === 'production' && filterName && (
              <button 
                onClick={() => setFilterName('')}
                className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2"
              >
                Remover Filtro: <span className="text-indigo-900">{filterName}</span> ✕
              </button>
            )}
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              summary={financialSummary} 
              production={production} 
              onPrintSeamstress={handleGoToPrint}
            />
          )}

          {activeTab === 'production' && (
            <ProductionTable 
              data={production} 
              catalog={catalog}
              filterName={filterName}
              setFilterName={setFilterName}
              onAdd={addProduction} 
              onUpdate={updateProduction}
              onToggleStatus={togglePaymentStatus}
              onDelete={deleteProduction} 
            />
          )}

          {activeTab === 'catalog' && (
            <Catalog 
              products={catalog}
              onAdd={addCatalog}
              onUpdate={updateCatalog}
              onDelete={deleteCatalog}
            />
          )}

          {activeTab === 'ranking' && (
            <Ranking production={production} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
