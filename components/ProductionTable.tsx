
import React, { useState, useEffect, useMemo } from 'react';
import { ProductionEntry, ProductCatalog } from '../types';

interface ProductionTableProps {
  data: ProductionEntry[];
  catalog: ProductCatalog[];
  filterName: string;
  setFilterName: (name: string) => void;
  onAdd: (entry: Omit<ProductionEntry, 'id' | 'total' | 'status'>) => void;
  onUpdate: (id: string, entry: Omit<ProductionEntry, 'id' | 'total'>) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

const ProductionTable: React.FC<ProductionTableProps> = ({ 
  data, 
  catalog, 
  filterName, 
  setFilterName, 
  onAdd, 
  onUpdate, 
  onToggleStatus,
  onDelete 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    seamstress: '',
    product: '',
    quantity: 1,
    unitValue: 0,
    status: 'pendente' as 'pago' | 'pendente'
  });

  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pago' | 'pendente'>('todos');

  useEffect(() => {
    if (!editingId) {
      const selected = catalog.find(p => p.name === formData.product);
      if (selected) {
        setFormData(prev => ({ ...prev, unitValue: selected.productionPrice }));
      }
    }
  }, [formData.product, catalog, editingId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.seamstress) { alert("Informe o nome do(a) costureiro(a)"); return; }
    if (!formData.product) { alert("Selecione um produto"); return; }
    
    if (editingId) {
      onUpdate(editingId, { ...formData, total: formData.quantity * formData.unitValue } as any);
      setEditingId(null);
    } else {
      onAdd(formData);
    }
    
    setFormData({ ...formData, seamstress: '', product: '', quantity: 1, unitValue: 0, status: 'pendente' });
    setIsAdding(false);
  };

  const startEdit = (entry: ProductionEntry) => {
    setFormData({
      date: entry.date,
      seamstress: entry.seamstress,
      product: entry.product,
      quantity: entry.quantity,
      unitValue: entry.unitValue,
      status: entry.status
    });
    setEditingId(entry.id);
    setIsAdding(true);
  };

  const filteredData = useMemo(() => {
    return data.filter(entry => {
      if (filterStartDate && entry.date < filterStartDate) return false;
      if (filterEndDate && entry.date > filterEndDate) return false;
      if (filterName && !entry.seamstress.toLowerCase().includes(filterName.toLowerCase())) return false;
      if (statusFilter !== 'todos' && entry.status !== statusFilter) return false;
      return true;
    });
  }, [data, filterStartDate, filterEndDate, filterName, statusFilter]);

  const totals = useMemo(() => {
    const totalValue = filteredData.reduce((acc, curr) => acc + curr.total, 0);
    const totalPending = filteredData.filter(i => i.status === 'pendente').reduce((acc, curr) => acc + curr.total, 0);
    const totalPaid = filteredData.filter(i => i.status === 'pago').reduce((acc, curr) => acc + curr.total, 0);
    const totalQty = filteredData.reduce((acc, curr) => acc + curr.quantity, 0);
    return { totalValue, totalPending, totalPaid, totalQty };
  }, [filteredData]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
  };

  return (
    <div className="space-y-4">
      {/* CABEÇALHO PARA O PDF - PRETO E BRANCO TOTAL */}
      <div className="print-only mb-10">
        <div className="flex justify-between items-end border-b-4 border-black pb-4 mb-8">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Relatório de Pagamento</h1>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">SewMaster - Gestão Profissional</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-bold uppercase opacity-60">Valor Total a Pagar:</p>
             <p className="text-4xl font-black">{formatCurrency(totals.totalPending)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
           <div className="border-2 border-black p-4 rounded-2xl">
              <p className="text-[9px] font-bold uppercase mb-1 opacity-60">Colaborador(a)</p>
              <p className="text-2xl font-black">{filterName || 'RELATÓRIO GERAL'}</p>
           </div>
           <div className="border-2 border-black p-4 rounded-2xl">
              <p className="text-[9px] font-bold uppercase mb-1 opacity-60">Data de Emissão</p>
              <p className="text-xl font-bold">{new Date().toLocaleDateString('pt-BR')}</p>
           </div>
           <div className="border-2 border-black p-4 rounded-2xl">
              <p className="text-[9px] font-bold uppercase mb-1 opacity-60">Total Produzido</p>
              <p className="text-xl font-bold">{totals.totalQty} Peças</p>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <h3 className="text-xl font-black text-slate-800">Registros de Produção</h3>
        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            disabled={isPrinting}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 cursor-pointer"
          >
            {isPrinting ? '⏳ Preparando...' : '📄 Exportar PDF'}
          </button>
          <button 
            onClick={() => {
              setEditingId(null);
              setIsAdding(!isAdding);
              setFormData({ ...formData, seamstress: '', product: '', quantity: 1, unitValue: 0, status: 'pendente' });
            }}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 cursor-pointer"
          >
            {isAdding ? 'Cancelar' : '+ Novo Lote'}
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-xl grid grid-cols-1 md:grid-cols-6 gap-4 animate-in fade-in slide-in-from-top-2 no-print">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 uppercase">Data</label>
            <input 
              type="date" 
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 uppercase">Costureira(o)</label>
            <input 
              type="text" 
              placeholder="Nome"
              value={formData.seamstress}
              onChange={e => setFormData({...formData, seamstress: e.target.value})}
              className="border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 uppercase">Produto</label>
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
            <label className="text-[9px] font-black text-slate-400 uppercase">Qtd</label>
            <input 
              type="number" 
              value={formData.quantity}
              onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
              className="border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 uppercase">Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as any})}
              className="border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className={`w-full ${editingId ? 'bg-amber-600' : 'bg-emerald-600'} text-white p-2.5 rounded-lg font-black text-xs uppercase transition-all shadow-lg`}>
              {editingId ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-4 no-print">
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-[9px] font-black text-slate-400 uppercase">Filtrar por nome</label>
          <input 
            type="text" 
            placeholder="Digite o nome..."
            value={filterName}
            onChange={e => setFilterName(e.target.value)}
            className="border-b-2 border-slate-100 p-2 text-sm outline-none focus:border-indigo-600 bg-transparent font-bold"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-black text-slate-400 uppercase">Status</label>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="border border-slate-100 rounded-lg p-2 text-xs font-bold outline-none"
          >
            <option value="todos">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-black text-slate-400 uppercase">Início</label>
          <input 
            type="date" 
            value={filterStartDate}
            onChange={e => setFilterStartDate(e.target.value)}
            className="border border-slate-100 rounded-lg p-2 text-xs font-bold outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-black text-slate-400 uppercase">Fim</label>
          <input 
            type="date" 
            value={filterEndDate}
            onChange={e => setFilterEndDate(e.target.value)}
            className="border border-slate-100 rounded-lg p-2 text-xs font-bold outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-white border-b border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="p-4">Data</th>
                <th className="p-4">Colaborador</th>
                <th className="p-4">Produto</th>
                <th className="p-4 text-center">Qtd</th>
                <th className="p-4">Total</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right no-print">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-20 text-center text-slate-300 italic font-medium">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : filteredData.map((entry) => (
                <tr key={entry.id} className={`hover:bg-slate-50 transition-colors ${entry.status === 'pago' ? 'bg-slate-50/20' : 'bg-white'}`}>
                  <td className="p-4 text-xs font-medium text-slate-500">{entry.date.split('-').reverse().join('/')}</td>
                  <td className="p-4 font-black text-slate-900">{entry.seamstress}</td>
                  <td className="p-4 text-xs font-medium">{entry.product}</td>
                  <td className="p-4 text-center font-bold">{entry.quantity}</td>
                  <td className="p-4 font-black text-slate-900">{formatCurrency(entry.total)}</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => onToggleStatus(entry.id)}
                      className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest no-print border transition-all ${
                        entry.status === 'pago' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}
                    >
                      {entry.status === 'pago' ? 'PAGO' : 'PENDENTE'}
                    </button>
                    <span className={`print-only font-bold uppercase text-[9px] ${entry.status === 'pago' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {entry.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2 no-print whitespace-nowrap">
                    <button onClick={() => startEdit(entry)} className="bg-slate-100 text-slate-600 px-3 py-1 rounded text-[9px] font-black uppercase hover:bg-amber-100 hover:text-amber-700">Editar</button>
                    <button onClick={() => onDelete(entry.id)} className="bg-slate-100 text-slate-400 px-2 py-1 rounded text-[9px] font-black hover:bg-rose-100 hover:text-rose-600">X</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-900 text-white font-black border-t-2 border-slate-700">
              <tr>
                <td colSpan={3} className="p-4 text-right text-[8px] uppercase tracking-widest opacity-60">Total Acumulado:</td>
                <td className="p-4 text-center">{totals.totalQty} pçs</td>
                <td className="p-4 text-lg">{formatCurrency(totals.totalValue)}</td>
                <td className="p-4 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-rose-400 text-[8px] font-black uppercase">Pendente: {formatCurrency(totals.totalPending)}</span>
                      <span className="text-emerald-400 text-[8px] font-black uppercase">Pago: {formatCurrency(totals.totalPaid)}</span>
                    </div>
                </td>
                <td className="no-print"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* RODAPÉ DO RECIBO PARA O PDF */}
      <div className="print-only mt-24 px-12">
        <div className="grid grid-cols-2 gap-40">
           <div className="text-center">
              <div className="border-t-2 border-black pt-4">
                 <p className="font-black uppercase text-xs">Assinatura do Responsável</p>
                 <p className="text-[10px] text-slate-500 mt-1 uppercase">SewMaster Management</p>
              </div>
           </div>
           <div className="text-center">
              <div className="border-t-2 border-black pt-4">
                 <p className="font-black uppercase text-xs">{filterName || 'Colaborador(a)'}</p>
                 <p className="text-[10px] text-slate-500 mt-1 uppercase">Assinatura de Recebimento</p>
              </div>
           </div>
        </div>
        <p className="mt-16 text-center text-[9px] text-slate-400 uppercase tracking-[0.5em] font-medium">
           Documento válido para acerto de contas interno - Gerado em {new Date().toLocaleString('pt-BR')}
        </p>
      </div>
    </div>
  );
};

export default ProductionTable;
