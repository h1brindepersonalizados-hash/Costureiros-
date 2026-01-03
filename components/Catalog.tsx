
import React, { useState } from 'react';
import { ProductCatalog } from '../types';

interface CatalogProps {
  products: ProductCatalog[];
  onAdd: (product: Omit<ProductCatalog, 'id'>) => void;
  onDelete: (id: string) => void;
}

const Catalog: React.FC<CatalogProps> = ({ products, onAdd, onDelete }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price <= 0) return;
    onAdd({ name, productionPrice: price });
    setName('');
    setPrice(0);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Novo Produto no Catálogo</h3>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Nome do Produto (ex: Mochila)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 min-w-[200px] border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Preço pago por peça"
            value={price || ''}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-40 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
            Adicionar
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Produto</th>
              <th className="p-4 font-semibold text-slate-600">Valor Pago por Produção</th>
              <th className="p-4 font-semibold text-slate-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="p-4 font-medium text-slate-900">{p.name}</td>
                <td className="p-4 text-emerald-600 font-semibold">{formatCurrency(p.productionPrice)}</td>
                <td className="p-4 text-right">
                  <button onClick={() => onDelete(p.id)} className="text-rose-500 hover:text-rose-700">Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Catalog;
