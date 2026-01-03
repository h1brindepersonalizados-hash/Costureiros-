
import React, { useState } from 'react';
import { SalesEntry } from '../types';

interface SalesTableProps {
  data: SalesEntry[];
  onAdd: (entry: Omit<SalesEntry, 'id' | 'total'>) => void;
  onDelete: (id: string) => void;
}

const SalesTable: React.FC<SalesTableProps> = ({ data, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    product: '',
    quantity: 1,
    salePrice: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product || formData.salePrice <= 0) return;
    onAdd(formData);
    setFormData({ ...formData, product: '', quantity: 1, salePrice: 0 });
    setIsAdding(false);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-slate-800">Registros de Vendas</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-sm"
        >
          {isAdding ? 'Cancelar' : '+ Nova Venda'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Data</label>
            <input 
              type="date" 
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Produto Vendido</label>
            <input 
              type="text" 
              placeholder="Ex: Vestido Festa"
              value={formData.product}
              onChange={e => setFormData({...formData, product: e.target.value})}
              className="border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Quant / Preço</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                className="w-1/3 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <input 
                type="number" 
                step="0.01"
                placeholder="R$ Preço"
                value={formData.salePrice}
                onChange={e => setFormData({...formData, salePrice: Number(e.target.value)})}
                className="flex-1 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full bg-emerald-600 text-white p-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
              Registrar Venda
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Data</th>
              <th className="p-4 font-semibold text-slate-600">Produto</th>
              <th className="p-4 font-semibold text-slate-600">Quantidade</th>
              <th className="p-4 font-semibold text-slate-600">Preço Venda</th>
              <th className="p-4 font-semibold text-slate-600">Total Venda</th>
              <th className="p-4 font-semibold text-slate-600">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">Nenhuma venda registrada.</td>
              </tr>
            ) : data.map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">{entry.date}</td>
                <td className="p-4 font-medium text-slate-900">{entry.product}</td>
                <td className="p-4">{entry.quantity}</td>
                <td className="p-4">{formatCurrency(entry.salePrice)}</td>
                <td className="p-4 font-semibold text-purple-600">{formatCurrency(entry.total)}</td>
                <td className="p-4">
                  <button 
                    onClick={() => onDelete(entry.id)}
                    className="text-rose-500 hover:text-rose-700 font-medium"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesTable;
