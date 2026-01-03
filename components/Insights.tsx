
import React, { useState } from 'react';
import { ProductionEntry, FinancialSummary } from '../types';
import { getBusinessInsights } from '../services/gemini';

interface InsightsProps {
  production: ProductionEntry[];
  summary: FinancialSummary;
}

const Insights: React.FC<InsightsProps> = ({ production, summary }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const generate = async () => {
    setLoading(true);
    const result = await getBusinessInsights(production, summary);
    setInsight(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl overflow-hidden relative">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-serif font-bold mb-4">Análise de Produtividade</h2>
          <p className="text-indigo-100 mb-6">
            O Gemini analisa o desempenho de cada costureiro(a) e os custos de produção
            para ajudar você a gerenciar melhor sua oficina.
          </p>
          <button 
            onClick={generate}
            disabled={loading}
            className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin"></div>
                Analisando produção...
              </>
            ) : (
              <>✨ Analisar Equipe</>
            )}
          </button>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-indigo-800 opacity-20 transform skew-x-12 translate-x-1/2"></div>
      </div>

      {insight && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="prose prose-slate max-w-none">
            {insight.split('\n').map((line, i) => {
              if (line.startsWith('#')) return <h3 key={i} className="text-xl font-bold text-slate-800 mt-4 mb-2">{line.replace(/#/g, '').trim()}</h3>;
              if (line.startsWith('-') || line.startsWith('*')) return <li key={i} className="ml-4 text-slate-600">{line.replace(/[-*]/, '').trim()}</li>;
              return <p key={i} className="text-slate-600 mb-2">{line}</p>;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Insights;
