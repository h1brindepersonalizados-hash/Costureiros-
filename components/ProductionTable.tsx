
import React, { useState, useEffect, useMemo } from 'react';
import { ProductionEntry, ProductCatalog } from '../types';

interface ProductionTableProps {
  data: ProductionEntry[];
  catalog: ProductCatalog[];
  onAdd: (entry: Omit<ProductionEntry, 'id' | 'total'>) => void;
  onDelete: (id: string) => void;
}

const ProductionTable: React.FC<ProductionTableProps> = ({ data, catalog, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    seamstress: '',
    product: '',
    quantity: 1,
    unitValue: 0
  });

  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  useEffect(() => {
    const selected = catalog.find(p => p.name === formData.product);
    if (selected) {
      setFormData(prev => ({ ...prev, unitValue: selected.productionPrice }));
    }
  }, [formData.product, catalog]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.seamstress) { alert("Informe o nome do(a) costureiro(a)"); return; }
    if (!formData.product) { alert("Selecione um produto"); return; }
    if (formData.quantity <= 0) { alert("A quantidade deve ser maior que zero"); return; }
    
    onAdd(formData);
    setFormData({ ...formData, seamstress: '', product: '', quantity: 1, unitValue: 0 });
    setIsAdding(false);
  };

  const filteredData = useMemo(() => {
    return data.filter(entry => {
      // Comparação direta de strings YYYY-MM-DD para evitar bugs de fuso horário
      if (filterStartDate && entry.date < filterStartDate) return false;
      if (filterEndDate && entry.date > filterEndDate) return false;
      return true;
    });
  }, [data, filterStartDate, filterEndDate]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-xl font-semibold text-slate-800">Registros de Produção</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          {isAdding ? 'Cancelar' : '+ Novo Lote'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md grid grid-cols-1 md:grid-cols-5 gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Data</label>
            <input 
              type="date" 
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Costureiro(a)</label>
            <input 
              type="text" 
              placeholder="Nome"
              value={formData.seamstress}
              onChange={e => setFormData({...formData, seamstress: e.target.value})}
              className="border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Produto</label>
            <select
              value={formData.product}
              onChange={e => setFormData({...formData, product: e.target.value})}
              className="border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Selecione...</option>
              {catalog.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Quantidade</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full bg-emerald-600 text-white p-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
              Salvar Lote
            </button>
          </div>
        </form>
      )}

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Início</label>
          <input 
            type="date" 
            value={filterStartDate}
            onChange={e => setFilterStartDate(e.target.value)}
            className="border border-slate-200 rounded-lg p-2 text-sm outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Fim</label>
          <input 
            type="date" 
            value={filterEndDate}
            onChange={e => setFilterEndDate(e.target.value)}
            className="border border-slate-200 rounded-lg p-2 text-sm outline-none"
          />
        </div>
        {(filterStartDate || filterEndDate) && (
          <button onClick={() => {setFilterStartDate(''); setFilterEndDate('')}} className="text-indigo-600 text-xs font-bold pb-2">LIMPAR</button>
        )}
        <div className="ml-auto text-xs text-slate-400 pb-2">
          {filteredData.length} registros exibidos
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Data</th>
              <th className="p-4 font-semibold text-slate-600">Costureiro(a)</th>
              <th className="p-4 font-semibold text-slate-600">Produto</th>
              <th className="p-4 font-semibold text-slate-600 text-center">Qtd</th>
              <th className="p-4 font-semibold text-slate-600">Total</th>
              <th className="p-4 font-semibold text-slate-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-slate-400 italic">
                  Nenhum registro encontrado para este período.
                </td>
              </tr>
            ) : filteredData.map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50">
                <td className="p-4">{entry.date.split('-').reverse().join('/')}</td>
                <td className="p-4 font-medium">{entry.seamstress}</td>
                <td className="p-4">{entry.product}</td>
                <td className="p-4 text-center">{entry.quantity}</td>
                <td className="p-4 font-semibold text-indigo-600">{formatCurrency(entry.total)}</td>
                <td className="p-4 text-right">
                  <button onClick={() => onDelete(entry.id)} className="text-rose-500 hover:text-rose-700">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductionTable;
