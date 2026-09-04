import { useGraphStore } from '../../store/useGraphStore';
import { ShaderRenderer } from '../../core/gl/ShaderRenderer';
import { Play, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  isSidebarOpen: boolean;
  isDockOpen: boolean;
  toggleSidebar: () => void;
  toggleDock: () => void;
}

export const Header = ({ isSidebarOpen, isDockOpen, toggleSidebar, toggleDock }: HeaderProps) => {
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
      
      const dataUrl = renderer.bakeTexture(1024);
      
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
    <header className="h-14 bg-secondary/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 shrink-0 z-10">
      <div className="flex items-center gap-2">
        <button 
          onClick={toggleSidebar}
          className={`p-2 rounded-md transition-all ${isSidebarOpen ? 'bg-primary/50 text-accent ring-1 ring-accent/30' : 'text-text-muted hover:text-text hover:bg-primary/50'}`}
          title="Toggle Sidebar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </button>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-lg shadow-accent/20 ml-2">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1 className="text-sm font-bold text-text ml-2 tracking-wide">ShaderGraph</h1>
      </div>
      
      <div className="flex items-center gap-3">
        {compilerError && (
          <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-3 py-1.5 rounded-md border border-red-400/20 shadow-inner">
            <AlertTriangle size={14} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Error</span>
          </div>
        )}
        
        <button 
          onClick={handleExport}
          disabled={!!compilerError}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all border shadow-sm ${
            compilerError 
              ? 'opacity-50 cursor-not-allowed border-border/50 text-text-muted bg-primary/50' 
              : 'bg-gradient-to-b from-secondary to-primary border-border text-text hover:from-accent hover:to-accent-hover hover:border-accent-hover hover:text-white hover:shadow-accent/20'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Export Texture
        </button>

        <button 
          onClick={compile}
          className="flex items-center gap-2 bg-gradient-to-b from-primary to-primary/80 hover:from-border hover:to-border/80 text-text text-[11px] font-semibold border border-border px-3 py-1.5 rounded-md transition-all shadow-sm"
        >
          <Play size={14} className="fill-current" />
          Compile
        </button>

        <div className="w-px h-6 bg-border mx-1"></div>
        
        <button 
          onClick={toggleDock}
          className={`p-2 rounded-md transition-all ${isDockOpen ? 'bg-primary/50 text-accent ring-1 ring-accent/30' : 'text-text-muted hover:text-text hover:bg-primary/50'}`}
          title="Toggle Preview Dock"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </button>
      </div>
    </header>
  );
};
