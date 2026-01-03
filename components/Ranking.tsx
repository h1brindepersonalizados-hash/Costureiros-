
import React, { useMemo } from 'react';
import { ProductionEntry } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface RankingProps {
  production: ProductionEntry[];
}

const Ranking: React.FC<RankingProps> = ({ production }) => {
  const rankingData = useMemo(() => {
    const stats: Record<string, { quantity: number; value: number; pending: number; paid: number; displayName: string }> = {};
    
    production.forEach(p => {
      const key = p.seamstress.trim().toLowerCase();
      if (!stats[key]) {
        stats[key] = { quantity: 0, value: 0, pending: 0, paid: 0, displayName: p.seamstress.trim() };
      }
      stats[key].quantity += p.quantity;
      stats[key].value += p.total;
      if (p.status === 'pago') stats[key].paid += p.total;
      else stats[key].pending += p.total;
    });

    return Object.values(stats)
      .sort((a, b) => b.quantity - a.quantity);
  }, [production]);

  const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handlePrintConsolidated = () => {
    window.print();
  };

  const totalsConsolidated = useMemo(() => {
    return rankingData.reduce((acc, curr) => ({
      qty: acc.qty + curr.quantity,
      val: acc.val + curr.value,
      pending: acc.pending + curr.pending,
      paid: acc.paid + curr.paid
    }), { qty: 0, val: 0, pending: 0, paid: 0 });
  }, [rankingData]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER DE IMPRESSÃO CONSOLIDADO */}
      <div className="print-only mb-10">
        <div className="flex justify-between items-end border-b-4 border-black pb-4 mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Relatório Consolidado Mensal</h1>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Controle de Produção - Fechamento de Mês</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-bold uppercase opacity-60">Total Geral da Folha:</p>
             <h2 className="text-3xl font-black">{formatCurrency(totalsConsolidated.val)}</h2>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-8">
           <div className="border border-black p-3 rounded-xl text-center">
              <p className="text-[8px] font-black uppercase opacity-60">Total Peças</p>
              <p className="text-lg font-bold">{totalsConsolidated.qty}</p>
           </div>
           <div className="border border-black p-3 rounded-xl text-center">
              <p className="text-[8px] font-black uppercase opacity-60">Total Pago</p>
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalsConsolidated.paid)}</p>
           </div>
           <div className="border border-black p-3 rounded-xl text-center">
              <p className="text-[8px] font-black uppercase opacity-60">Total Pendente</p>
              <p className="text-lg font-bold text-rose-600">{formatCurrency(totalsConsolidated.pending)}</p>
           </div>
           <div className="border border-black p-3 rounded-xl text-center">
              <p className="text-[8px] font-black uppercase opacity-60">Data Relatório</p>
              <p className="text-lg font-bold">{new Date().toLocaleDateString('pt-BR')}</p>
           </div>
        </div>
      </div>

      <div className="flex justify-between items-center no-print">
        <h3 className="text-slate-800 font-black uppercase text-xs tracking-widest">Resumo de Performance</h3>
        <button 
          onClick={handlePrintConsolidated}
          className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
        >
          📄 PDF Consolidado
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabela de Ranking */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden card">
          <div className="p-6 border-b border-slate-50 no-print">
            <h4 className="text-slate-800 font-black uppercase text-xs tracking-widest">Top Produtividade (Peças)</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-bold uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4 no-print">Posição</th>
                  <th className="px-6 py-4">Colaborador</th>
                  <th className="px-6 py-4 text-center">Peças</th>
                  <th className="px-6 py-4 text-right">Pago</th>
                  <th className="px-6 py-4 text-right">Pendente</th>
                  <th className="px-6 py-4 text-right">Total Bruto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rankingData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-indigo-50/20 transition-colors group">
                    <td className="px-6 py-4 no-print">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full font-black text-xs bg-slate-100 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {idx + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="no-print">
                          {idx === 0 && <span className="text-xl">🥇</span>}
                          {idx === 1 && <span className="text-xl">🥈</span>}
                          {idx === 2 && <span className="text-xl">🥉</span>}
                        </span>
                        <span className="font-black text-slate-900">{item.displayName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-indigo-600">{item.quantity}</td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-600">{formatCurrency(item.paid)}</td>
                    <td className="px-6 py-4 text-right font-medium text-rose-600">{formatCurrency(item.pending)}</td>
                    <td className="px-6 py-4 text-right font-black text-slate-900">{formatCurrency(item.value)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-black print:bg-white print:text-black print:border-t-2 print:border-black">
                <tr>
                   <td className="px-6 py-4 no-print"></td>
                   <td className="px-6 py-4 uppercase text-[10px]">TOTAIS GERAIS</td>
                   <td className="px-6 py-4 text-center">{totalsConsolidated.qty}</td>
                   <td className="px-6 py-4 text-right text-emerald-400 print:text-black">{formatCurrency(totalsConsolidated.paid)}</td>
                   <td className="px-6 py-4 text-right text-rose-400 print:text-black">{formatCurrency(totalsConsolidated.pending)}</td>
                   <td className="px-6 py-4 text-right">{formatCurrency(totalsConsolidated.val)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Gráfico de Ranking - Oculto na impressão para focar nos dados financeiros */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col no-print">
          <h4 className="text-slate-800 font-black uppercase text-xs tracking-widest mb-8">Comparativo de Volume</h4>
          <div className="flex-1 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rankingData.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="displayName" 
                  type="category" 
                  width={100} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: number) => [`${val} peças`, 'Quantidade']}
                />
                <Bar dataKey="quantity" radius={[0, 4, 4, 0]} barSize={20}>
                  {rankingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-4 font-bold uppercase tracking-widest">Consolidado por Colaborador</p>
        </div>
      </div>

      {/* Destaque do Líder */}
      {rankingData.length > 0 && (
        <div className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-100 no-print">
           <div>
              <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Destaque de Produtividade</p>
              <h3 className="text-3xl font-black">{rankingData[0].displayName}</h3>
              <p className="text-indigo-100 mt-2 opacity-80">Liderando a produção com um total de <strong>{rankingData[0].quantity} peças</strong> finalizadas.</p>
           </div>
           <div className="text-center bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
              <p className="text-[10px] font-black uppercase mb-1">Total Gerado</p>
              <p className="text-2xl font-black">{formatCurrency(rankingData[0].value)}</p>
           </div>
        </div>
      )}

      {/* RODAPÉ DO PDF CONSOLIDADO */}
      <div className="print-only mt-24 text-center border-t-2 border-black pt-8">
         <p className="font-black uppercase text-xs tracking-widest">Fechamento Mensal de Produção - {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
         <p className="text-[9px] text-slate-500 mt-2">Relatório gerado automaticamente pelo Sistema de Controle de Produção</p>
      </div>
    </div>
  );
};

export default Ranking;
