import React from 'react';
import { useGraphStore } from '../../store/useGraphStore';
import { ShaderRenderer } from '../../core/gl/ShaderRenderer';
import { Play, AlertTriangle } from 'lucide-react';

export const Header = () => {
  const { compilerError, compile, glslCode } = useGraphStore();

  const handleExport = () => {
    if (!glslCode || compilerError) {
      alert("Cannot export: Shader has errors or is empty.");
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const renderer = new ShaderRenderer(canvas);
      renderer.updateShader(glslCode);
      
      const dataUrl = renderer.bakeToTexture(1024);
      
      renderer.destroy();

      if (dataUrl) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `shader_export_${Date.now()}.png`;
        a.click();
      }
    } catch (e) {
      console.error(e);
      alert("Export failed. Check console for details.");
    }
  };

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
            <span className="text-xs font-semibold uppercase tracking-wider">Error</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-1.5 rounded-md border border-green-400/20">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider">Live</span>
          </div>
        )}
        
        <button 
          onClick={handleExport}
          disabled={!!compilerError}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors border ${compilerError ? 'opacity-50 cursor-not-allowed border-border text-text-muted bg-primary' : 'bg-secondary border-border text-text hover:bg-accent hover:border-accent hover:text-white shadow-sm'}`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Export Texture
        </button>

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
