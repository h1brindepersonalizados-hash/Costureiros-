
import React, { useMemo } from 'react';
import { ProductionEntry } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface RankingProps {
  production: ProductionEntry[];
}

const Ranking: React.FC<RankingProps> = ({ production }) => {
  const rankingData = useMemo(() => {
    const stats: Record<string, { quantity: number; value: number; displayName: string }> = {};
    
    production.forEach(p => {
      const key = p.seamstress.trim().toLowerCase();
      if (!stats[key]) {
        stats[key] = { quantity: 0, value: 0, displayName: p.seamstress.trim() };
      }
      stats[key].quantity += p.quantity;
      stats[key].value += p.total;
    });

    return Object.values(stats)
      .sort((a, b) => b.quantity - a.quantity);
  }, [production]);

  const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabela de Ranking */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <h4 className="text-slate-800 font-black uppercase text-xs tracking-widest">Top Produtividade (Peças)</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-bold uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4">Posição</th>
                  <th className="px-6 py-4">Colaborador</th>
                  <th className="px-6 py-4 text-center">Peças</th>
                  <th className="px-6 py-4 text-right">Produção Bruta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rankingData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-indigo-50/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full font-black text-xs bg-slate-100 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {idx + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {idx === 0 && <span className="text-xl">🥇</span>}
                        {idx === 1 && <span className="text-xl">🥈</span>}
                        {idx === 2 && <span className="text-xl">🥉</span>}
                        <span className="font-black text-slate-900">{item.displayName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-indigo-600">{item.quantity}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-500">{formatCurrency(item.value)}</td>
                  </tr>
                ))}
                {rankingData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-slate-400 italic font-medium">Nenhum dado para exibir no ranking.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gráfico de Ranking */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
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
        <div className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-100">
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
    </div>
  );
};

export default Ranking;
