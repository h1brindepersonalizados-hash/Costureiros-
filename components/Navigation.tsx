
import React from 'react';
import { AppTab } from '../types';

interface NavigationProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const menuItems: { id: AppTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Início', icon: '💳' },
    { id: 'production', label: 'Produção', icon: '🧵' },
    { id: 'catalog', label: 'Catálogo', icon: '🏷️' },
    { id: 'insights', label: 'IA', icon: '✨' },
  ];

  return (
    <>
      {/* Sidebar para Desktop */}
      <nav className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-200">
            🧵
          </div>
          <span className="font-serif font-bold text-2xl text-slate-800">SewMaster</span>
        </div>

        <div className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-100'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-xs text-slate-400 text-center font-medium">Versão 1.0 App Standalone</p>
        </div>
      </nav>

      {/* Bottom Nav para Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-100 px-6 py-3 z-50 flex justify-between items-center safe-area-bottom">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="flex flex-col items-center gap-1 relative"
          >
            <span className={`text-2xl transition-transform duration-200 ${activeTab === item.id ? 'scale-110' : 'opacity-50'}`}>
              {item.icon}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'}`}>
              {item.label}
            </span>
            {activeTab === item.id && (
              <span className="absolute -top-1 w-1 h-1 bg-indigo-600 rounded-full animate-pulse"></span>
            )}
          </button>
        ))}
      </nav>
    </>
  );
};

export default Navigation;
