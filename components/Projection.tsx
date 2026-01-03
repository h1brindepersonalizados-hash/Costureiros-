
import React, { useMemo } from 'react';
import { ProductionEntry } from '../types';

interface ProjectionProps {
  production: ProductionEntry[];
}

const Projection: React.FC<ProjectionProps> = ({ production }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dayOfMonth = now.getDate();

    // Filtra produção do mês atual
    const monthProduction = production.filter(p => {
      const d = new Date(p.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalCurrentMonth = monthProduction.reduce((acc, curr) => acc + curr.total, 0);
    const dailyAverage = dayOfMonth > 0 ? totalCurrentMonth / dayOfMonth : 0;
    const projectedTotal = dailyAverage * daysInMonth;

    return {
      totalCurrentMonth,
      projectedTotal,
      dailyAverage,
      daysRemaining: daysInMonth - dayOfMonth,
      progress: (dayOfMonth / daysInMonth) * 100
    };
  }, [production]);

  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date());

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-indigo-100 text-xs font-black uppercase tracking-widest mb-2">Estimativa para {monthName}</p>
          <h2 className="text-4xl font-black mb-2">Projeção: {formatCurrency(stats.projectedTotal)}</h2>
          <p className="text-indigo-100 text-sm opacity-80">
            Com base na produção atual de {formatCurrency(stats.totalCurrentMonth)} nos primeiros {new Date().getDate()} dias.
          </p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-12">
           <span className="text-[150px]">📈</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Progresso do Mês</h4>
          <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden mb-4">
             <div 
               className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-1000"
               style={{ width: `${stats.progress}%` }}
             ></div>
          </div>
          <div className="flex justify-between text-xs font-bold text-slate-500">
             <span>Dia 1</span>
             <span>Dia {new Date().getDate()} (Hoje)</span>
             <span>Dia {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Média Diária de Pagamentos</p>
           <p className="text-2xl font-black text-slate-900">{formatCurrency(stats.dailyAverage)}</p>
           <p className="text-xs text-slate-400 mt-2">Valor estimado que o ateliê gera em custos de mão de obra por dia.</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
         <div className="flex gap-4 items-start">
            <span className="text-2xl">💡</span>
            <div>
               <h5 className="font-black text-amber-900 text-sm uppercase">Insight de Fluxo</h5>
               <p className="text-amber-800 text-sm mt-1">
                 Faltam <strong>{stats.daysRemaining} dias</strong> para encerrar o mês. 
                 Se o ritmo de produção for mantido, você precisará de <strong>{formatCurrency(stats.projectedTotal - stats.totalCurrentMonth)}</strong> extras para quitar a produção futura deste mês.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Projection;
