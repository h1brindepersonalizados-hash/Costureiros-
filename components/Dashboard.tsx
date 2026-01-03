
import React, { useMemo } from 'react';
import { FinancialSummary, ProductionEntry } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface DashboardProps {
  summary: FinancialSummary;
  production: ProductionEntry[];
  onPrintSeamstress: (name: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ summary, production, onPrintSeamstress }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const seamstressStats = useMemo(() => {
    const stats: Record<string, { totalValue: number, totalQuantity: number, pending: number, paid: number, displayName: string }> = {};
    
    production.forEach(p => {
      // Normaliza para chave única mas guarda o nome original para exibição
      const key = p.seamstress.trim().toLowerCase();
      if (!stats[key]) {
        stats[key] = { 
          totalValue: 0, 
          totalQuantity: 0, 
          pending: 0, 
          paid: 0,
          displayName: p.seamstress.trim()
        };
      }
      stats[key].totalValue += p.total;
      stats[key].totalQuantity += p.quantity;
      if (p.status === 'pago') stats[key].paid += p.total;
      else stats[key].pending += p.total;
    });

    return Object.values(stats).sort((a, b) => b.pending - a.pending);
  }, [production]);

  return (
    <div className="space-y-6 no-print">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">A Pagar</p>
          <h3 className="text-3xl font-black text-rose-600 mt-1">{formatCurrency(summary.totalPending)}</h3>
          <div className="mt-2 text-[10px] text-rose-700 font-bold px-2 py-0.5 rounded bg-rose-50 inline-block">
            {summary.seamstressCount} colaboradores
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Já Pago</p>
          <h3 className="text-3xl font-black text-emerald-600 mt-1">{formatCurrency(summary.totalPaid)}</h3>
          <div className="mt-2 text-[10px] text-emerald-700 font-bold px-2 py-0.5 rounded bg-emerald-50 inline-block">
            Total quitado
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Produção</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">{summary.totalPieces}</h3>
          <div className="mt-2 text-[10px] text-amber-700 font-bold px-2 py-0.5 rounded bg-amber-50 inline-block">
            Peças totais
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h4 className="text-slate-800 font-bold">Resumo por Colaborador</h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Consolidado</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold">Colaborador</th>
                  <th className="px-6 py-4 font-bold text-center">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Valor Pendente</th>
                  <th className="px-6 py-4 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {seamstressStats.map((s, idx) => (
                  <tr key={idx} className="hover:bg-indigo-50/20 transition-colors">
                    <td className="px-6 py-4 font-black text-slate-900">{s.displayName}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${s.pending > 0 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                        {s.pending > 0 ? 'Pendente' : 'Pago'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900">{formatCurrency(s.pending)}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onPrintSeamstress(s.displayName)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2 ml-auto"
                      >
                        📄 Exportar PDF
                      </button>
                    </td>
                  </tr>
                ))}
                {seamstressStats.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-slate-400 italic">Registre a produção para ver o resumo.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
          <h4 className="text-slate-800 font-bold mb-4 w-full text-sm uppercase tracking-widest opacity-60">Divisão de Dívida</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={seamstressStats.filter(s => s.pending > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="pending"
                  nameKey="displayName"
                >
                  {seamstressStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-2 uppercase font-black tracking-widest">Top Pendências</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
