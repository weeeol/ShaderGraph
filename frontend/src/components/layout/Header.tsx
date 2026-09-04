import React from 'react';
import { useGraphStore } from '../../store/useGraphStore';
import { Play, AlertTriangle } from 'lucide-react';

export const Header = () => {
  const { compilerError, compile } = useGraphStore();

  return (
    <header className="h-14 bg-secondary border-b border-border flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1 className="text-lg font-bold text-text ml-2 tracking-tight">ShaderGraph</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {compilerError ? (
          <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-3 py-1.5 rounded-md border border-red-400/20">
            <AlertTriangle size={16} />
            <span className="text-xs font-medium">Compilation Error</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-1.5 rounded-md border border-green-400/20">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium">Live</span>
          </div>
        )}
        
        <button 
          onClick={compile}
          className="flex items-center gap-2 bg-primary hover:bg-border text-text border border-border px-3 py-1.5 rounded-md transition-colors"
        >
          <Play size={14} />
          <span className="text-xs font-medium">Force Compile</span>
        </button>
      </div>
    </header>
  );
};
