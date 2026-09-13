import { useGraphStore } from '../../store/useGraphStore';
import { ShaderRenderer } from '../../core/gl/ShaderRenderer';
import { 
  Play, 
  AlertTriangle, 
  HelpCircle, 
  FolderOpen, 
  Download, 
  PanelLeft, 
  PanelRight, 
  Sun, 
  Moon, 
  Undo2, 
  Redo2, 
  Plus,
  FileCode2
} from 'lucide-react';

interface HeaderProps {
  isSidebarOpen: boolean;
  isDockOpen: boolean;
  toggleSidebar: () => void;
  toggleDock: () => void;
  onOpenIntro?: () => void;
  onOpenWorkspace?: () => void;
  onOpenQuickSearch?: () => void;
  onOpenExport?: () => void;
}

export const Header = ({ 
  isSidebarOpen, 
  isDockOpen, 
  toggleSidebar, 
  toggleDock, 
  onOpenIntro, 
  onOpenWorkspace,
  onOpenQuickSearch,
  onOpenExport
}: HeaderProps) => {
  const { 
    compilerError, 
    compile, 
    glslCode, 
    currentGraphName, 
    theme, 
    toggleTheme, 
    past, 
    future, 
    undo, 
    redo 
  } = useGraphStore();

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
    <header className="h-11 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between px-3 shrink-0 z-20 select-none">
      {/* Left Title & Workspace Selector */}
      <div className="flex items-center gap-2 min-w-0">
        <button 
          onClick={toggleSidebar}
          className={`p-1.5 rounded-md transition-colors border ${
            isSidebarOpen 
              ? 'text-zinc-100 bg-zinc-800/90 border-zinc-700/80' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-transparent hover:border-zinc-800'
          }`}
          title="Toggle Node Library (Sidebar)"
        >
          <PanelLeft size={15} />
        </button>

        <span className="text-xs font-bold text-zinc-100 tracking-tight shrink-0 hidden xs:inline">
          ShaderGraph
        </span>

        {onOpenWorkspace && (
          <button
            onClick={onOpenWorkspace}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-zinc-700 text-xs font-medium text-zinc-300 hover:text-zinc-100 transition-colors group min-w-0"
            title="Open Workspaces & Starter Templates"
          >
            <FolderOpen size={13} className="text-zinc-400 group-hover:text-zinc-200 shrink-0" />
            <span className="truncate max-w-[100px] sm:max-w-[160px] font-mono text-xs text-zinc-200">
              {currentGraphName}
            </span>
            <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-zinc-950 text-zinc-500 border border-zinc-800/80 shrink-0 hidden sm:inline">
              Switch
            </span>
          </button>
        )}
      </div>

      {/* Right Controls & Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Undo / Redo */}
        <div className="flex items-center bg-zinc-900/70 border border-zinc-800/80 rounded-md p-0.5">
          <button
            onClick={undo}
            disabled={past.length === 0}
            className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={13} />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
          >
            <Redo2 size={13} />
          </button>
        </div>

        {/* Quick Add Node */}
        {onOpenQuickSearch && (
          <button
            onClick={onOpenQuickSearch}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-zinc-900/70 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 transition-colors"
            title="Search and Add Node (Tab or Right-Click)"
          >
            <Plus size={13} className="text-zinc-400" />
            <span className="hidden md:inline">Add Node</span>
            <kbd className="hidden lg:inline text-[9px] font-mono px-1 py-0.2 rounded bg-zinc-950 text-zinc-500 border border-zinc-800">
              Tab
            </kbd>
          </button>
        )}

        <div className="w-px h-4 bg-zinc-800/80 mx-0.5" />

        {/* Compiler Status (shown only on error) */}
        {compilerError && (
          <div className="flex items-center gap-1 text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-800/60 text-xs font-mono">
            <AlertTriangle size={12} />
            <span className="hidden sm:inline">Syntax Error</span>
          </div>
        )}

        {/* Bake Texture */}
        <button 
          onClick={handleExport}
          disabled={!!compilerError}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-900/70 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Bake procedural texture to 1024x1024 PNG"
        >
          <Download size={13} className="text-zinc-400 shrink-0" />
          <span className="hidden sm:inline">Bake PNG</span>
        </button>

        {/* Engine Export (Unity / WebGL) */}
        {onOpenExport && (
          <button
            onClick={onOpenExport}
            disabled={!!compilerError}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-900/70 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Export engine shader (Unity URP/HDRP, WebGL)"
          >
            <FileCode2 size={13} className="text-zinc-400 shrink-0" />
            <span className="hidden sm:inline">Export</span>
          </button>
        )}

        {/* Compile - The Singular Primary Action */}
        <button 
          onClick={compile}
          className="flex items-center gap-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold px-3 py-1 rounded-md transition-all shadow-xs active:scale-[0.98]"
          title="Recompile shader graph"
        >
          <Play size={12} className="fill-current shrink-0" />
          <span>Compile</span>
        </button>

        <div className="w-px h-4 bg-zinc-800/80 mx-0.5" />

        {/* Right Dock Toggle */}
        <button 
          onClick={toggleDock}
          className={`p-1.5 rounded-md transition-colors border ${
            isDockOpen 
              ? 'text-zinc-100 bg-zinc-800/90 border-zinc-700/80' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-transparent hover:border-zinc-800'
          }`}
          title="Toggle Preview Dock (3D Viewport & GLSL)"
        >
          <PanelRight size={15} />
        </button>

        {/* Theme Mode Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80 transition-colors border border-transparent hover:border-zinc-800"
          title={theme === 'dark' ? 'Switch to Eye-Friendly Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Quick Guide / Help */}
        {onOpenIntro && (
          <button 
            onClick={onOpenIntro}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80 transition-colors border border-transparent hover:border-zinc-800"
            title="Keyboard Shortcuts & Reference"
          >
            <HelpCircle size={15} />
          </button>
        )}
      </div>
    </header>
  );
};
