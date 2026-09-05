import { useGraphStore } from '../../store/useGraphStore';
import { ShaderRenderer } from '../../core/gl/ShaderRenderer';
import { Play, AlertTriangle, HelpCircle, FolderOpen, Download, PanelLeft, PanelRight, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  isSidebarOpen: boolean;
  isDockOpen: boolean;
  toggleSidebar: () => void;
  toggleDock: () => void;
  onOpenIntro?: () => void;
  onOpenWorkspace?: () => void;
}

export const Header = ({ 
  isSidebarOpen, 
  isDockOpen, 
  toggleSidebar, 
  toggleDock, 
  onOpenIntro, 
  onOpenWorkspace 
}: HeaderProps) => {
  const { compilerError, compile, glslCode, currentGraphName, theme, toggleTheme } = useGraphStore();

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
        a.download = `${currentGraphName.toLowerCase().replace(/\s+/g, '_')}_texture.png`;
        a.click();
      }
    } catch (e) {
      console.error(e);
      alert("Export failed. Check console for details.");
    }
  };

  return (
    <header className="h-12 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between px-3.5 shrink-0 z-20">
      {/* Left Title & Workspace Selector */}
      <div className="flex items-center gap-2.5">
        <button 
          onClick={toggleSidebar}
          className={`p-1.5 rounded-md transition-colors ${
            isSidebarOpen 
              ? 'text-zinc-200 bg-zinc-800' 
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
          }`}
          title="Toggle Node Library Panel"
        >
          <PanelLeft size={16} />
        </button>

        <h1 className="text-sm font-bold text-zinc-100 tracking-tight">ShaderGraph</h1>

        {onOpenWorkspace && (
          <button
            onClick={onOpenWorkspace}
            className="flex items-center gap-2 ml-2 px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-zinc-100 transition-colors group"
            title="Open Workspaces & Samples"
          >
            <FolderOpen size={13} className="text-zinc-400 group-hover:text-zinc-200" />
            <span className="truncate max-w-[170px] font-mono text-zinc-200">{currentGraphName}</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-zinc-950 text-zinc-500 border border-zinc-800/80">
              Switch
            </span>
          </button>
        )}
      </div>

      {/* Right Controls & Actions */}
      <div className="flex items-center gap-2.5">
        {/* Compiler Status (shown only on error) */}
        {compilerError && (
          <div className="flex items-center gap-1.5 text-red-400 bg-red-950/50 px-2.5 py-1 rounded border border-red-800/60 text-xs font-mono">
            <AlertTriangle size={13} />
            <span>Syntax Error</span>
          </div>
        )}

        {/* Bake Texture */}
        <button 
          onClick={handleExport}
          disabled={!!compilerError}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Bake procedural texture to 1024x1024 PNG"
        >
          <Download size={13} className="text-zinc-400" />
          <span>Export Texture</span>
        </button>

        {/* Compile Manual Trigger */}
        <button 
          onClick={compile}
          className="flex items-center gap-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors shadow-xs"
        >
          <Play size={12} className="fill-current" />
          <span>Compile</span>
        </button>

        <div className="w-px h-5 bg-zinc-800 mx-0.5" />

        {/* Right Dock Toggle */}
        <button 
          onClick={toggleDock}
          className={`p-1.5 rounded-md transition-colors ${
            isDockOpen 
              ? 'text-zinc-200 bg-zinc-800' 
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
          }`}
          title="Toggle Preview Dock"
        >
          <PanelRight size={16} />
        </button>

        {/* Theme Mode Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
          title={theme === 'dark' ? 'Switch to Eye-Friendly Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Quick Guide */}
        {onOpenIntro && (
          <button 
            onClick={onOpenIntro}
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
            title="Keyboard Shortcuts & Reference"
          >
            <HelpCircle size={16} />
          </button>
        )}
      </div>
    </header>
  );
};
