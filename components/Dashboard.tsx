
import React, { useMemo } from 'react';
import { FinancialSummary, ProductionEntry } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface DashboardProps {
  summary: FinancialSummary;
  production: ProductionEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ summary, production }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Agrupa pagamentos por costureiro
  const seamstressStats = useMemo(() => {
    const stats: Record<string, { totalValue: number, totalQuantity: number }> = {};
    
    production.forEach(p => {
      if (!stats[p.seamstress]) {
        stats[p.seamstress] = { totalValue: 0, totalQuantity: 0 };
      }
      stats[p.seamstress].totalValue += p.total;
      stats[p.seamstress].totalQuantity += p.quantity;
    });

    return Object.entries(stats).map(([name, data]) => ({
      name,
      ...data
    })).sort((a, b) => b.totalValue - a.totalValue);
  }, [production]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Total de Mão de Obra</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(summary.totalProductionCost)}</h3>
          <div className="mt-2 text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded inline-block">
            Folha total acumulada
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Peças Produzidas</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary.totalPieces} un.</h3>
          <div className="mt-2 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded inline-block">
            Volume total de trabalho
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Equipe Ativa</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary.seamstressCount} pessoas</h3>
          <div className="mt-2 text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded inline-block">
            Média de {summary.seamstressCount ? (summary.totalPieces / summary.seamstressCount).toFixed(1) : 0} pç/pessoa
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-slate-800 font-semibold mb-6 flex justify-between items-center">
            <span>Resumo de Pagamentos por Colaborador</span>
            <span className="text-xs text-slate-400 font-normal">Soma total de acordo com o catálogo</span>
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="pb-3 font-medium">Nome</th>
                  <th className="pb-3 font-medium text-center">Qtd Total</th>
                  <th className="pb-3 font-medium text-right">Total a Receber</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {seamstressStats.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-semibold text-slate-700">{s.name}</td>
                    <td className="py-4 text-center text-slate-500">{s.totalQuantity} pçs</td>
                    <td className="py-4 text-right font-bold text-emerald-600">{formatCurrency(s.totalValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
          <h4 className="text-slate-800 font-semibold mb-4 w-full">Distribuição da Produção</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={seamstressStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="totalValue"
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
          <div className="mt-4 grid grid-cols-2 gap-2 w-full">
             {seamstressStats.slice(0, 4).map((s, i) => (
               <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                 <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                 <span className="truncate">{s.name}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
