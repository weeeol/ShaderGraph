import { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  GitBranch, 
  Box, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface IntroModalProps {
  isOpen: boolean;
  onClose: (dontShowAgain?: boolean) => void;
  onAddStarterNode?: () => void;
}

export const IntroModal = ({ 
  isOpen, 
  onClose,
  onAddStarterNode 
}: IntroModalProps) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose(dontShowAgain);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dontShowAgain, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={() => onClose(dontShowAgain)}
    >
      <div 
        className="w-full max-w-2xl bg-zinc-950/95 border border-zinc-800/90 rounded-2xl p-7 shadow-2xl text-zinc-300 ring-1 ring-white/5 font-sans flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h2 className="font-mono text-sm font-bold text-zinc-100 tracking-wider uppercase">
              Quick Reference & Workflow
            </h2>
          </div>
          <button 
            onClick={() => onClose(dontShowAgain)}
            className="text-zinc-500 hover:text-zinc-200 transition-colors p-1.5 -mr-1 rounded-md hover:bg-zinc-900"
            title="Dismiss (Esc)"
          >
            <X size={17} />
          </button>
        </div>

        {/* Visual Mini-Graph Architecture */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 select-none">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Dataflow Architecture</span>
            <span className="text-zinc-500 text-[11px]">Automatic Type Promotion</span>
          </div>

          <div className="flex items-center justify-between gap-1.5 font-mono">
            {/* Mini Node 1: UV */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 flex flex-col gap-1 min-w-[105px] shadow-sm">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="text-[10.5px] px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-semibold">IN</span>
                <span className="text-[11px]">vec2</span>
              </div>
              <span className="font-bold text-zinc-100 text-sm">UV Coords</span>
            </div>

            {/* Wire connector */}
            <div className="flex-1 flex items-center justify-center relative px-1">
              <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500/70 via-cyan-500/70 to-blue-500/70" />
              <ArrowRight size={14} className="text-cyan-400 absolute" />
            </div>

            {/* Mini Node 2: Math/Color */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 flex flex-col gap-1 min-w-[105px] shadow-sm">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="text-[10.5px] px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 font-semibold">OP</span>
                <span className="text-[11px]">vec4</span>
              </div>
              <span className="font-bold text-zinc-100 text-sm">Sine / Mult</span>
            </div>

            {/* Wire connector */}
            <div className="flex-1 flex items-center justify-center relative px-1">
              <div className="h-0.5 w-full bg-gradient-to-r from-blue-500/70 via-indigo-500/70 to-amber-500/70" />
              <ArrowRight size={14} className="text-amber-400 absolute" />
            </div>

            {/* Mini Node 3: Master Output */}
            <div className="bg-zinc-950 border border-amber-900/50 rounded-lg p-2.5 flex flex-col gap-1 min-w-[105px] shadow-sm">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="text-[10.5px] px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-400 border border-amber-800/40 font-semibold">OUT</span>
                <span className="text-[11px]">RGB</span>
              </div>
              <span className="font-bold text-zinc-100 text-sm">Master</span>
            </div>
          </div>
        </div>

        {/* 3 Core Workflow Rules */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/50 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-zinc-100 font-semibold text-[13px]">
              <Search size={14} className="text-zinc-400" />
              <span>1. Spawn</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[10.5px] text-zinc-200">Tab</kbd> or <strong className="text-zinc-200">Right-Click</strong> on canvas to search and insert nodes.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/50 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-zinc-100 font-semibold text-[13px]">
              <GitBranch size={14} className="text-zinc-400" />
              <span>2. Connect</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Drag handles to route data. Scalars (<code className="font-mono text-[11px] text-zinc-300">float</code>) cast to vectors (<code className="font-mono text-[11px] text-zinc-300">vec4</code>) automatically.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/50 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-zinc-100 font-semibold text-[13px]">
              <Box size={14} className="text-zinc-400" />
              <span>3. Preview</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Orbit 3D mesh with left-click drag. Switch geometry or toggle wireframe in dock.
            </p>
          </div>
        </div>

        {/* Keybindings Grid */}
        <div className="pt-2 border-t border-zinc-800/80">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2.5">
            <span>Essential Keybindings</span>
            <span className="text-zinc-500 text-[11px]">Windows / macOS</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 font-mono">
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800/50">
              <span className="text-zinc-400 text-xs">Search</span>
              <kbd className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-200 text-xs border border-zinc-800 font-semibold">Tab / R-Click</kbd>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800/50">
              <span className="text-zinc-400 text-xs">Duplicate</span>
              <kbd className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-200 text-xs border border-zinc-800 font-semibold">Ctrl + D</kbd>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800/50">
              <span className="text-zinc-400 text-xs">Undo / Redo</span>
              <kbd className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-200 text-xs border border-zinc-800 font-semibold">Ctrl+Z / Y</kbd>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800/50">
              <span className="text-zinc-400 text-xs">Delete</span>
              <kbd className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-200 text-xs border border-zinc-800 font-semibold">Backspace</kbd>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800/50">
              <span className="text-zinc-400 text-xs">Pan</span>
              <kbd className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-200 text-xs border border-zinc-800 font-semibold">Space+Drag</kbd>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800/50">
              <span className="text-zinc-400 text-xs">Zoom</span>
              <kbd className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-200 text-xs border border-zinc-800 font-semibold">Scroll</kbd>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3.5 border-t border-zinc-800/80">
          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none hover:text-zinc-300">
            <input 
              type="checkbox" 
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 accent-zinc-500 cursor-pointer"
            />
            <span>Don't show on start</span>
          </label>

          <div className="flex items-center gap-2.5">
            {onAddStarterNode && (
              <button
                onClick={() => {
                  onAddStarterNode();
                  onClose(dontShowAgain);
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold rounded-lg transition-colors"
                title="Add a UV Coordinates node and link it to Master Output"
              >
                <Sparkles size={13} className="text-cyan-400" />
                <span>Load Starter UV Node</span>
              </button>
            )}

            <button
              onClick={() => onClose(dontShowAgain)}
              className="px-5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              Start Blank
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
