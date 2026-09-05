import { useState, useEffect } from 'react';
import { X, MousePointer2, GitBranch, Box, FileCode } from 'lucide-react';

interface IntroModalProps {
  isOpen: boolean;
  onClose: (dontShowAgain?: boolean) => void;
}

export const IntroModal = ({ isOpen, onClose }: IntroModalProps) => {
  const [dontShowAgain, setDontShowAgain] = useState(true);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={() => onClose(dontShowAgain)}
    >
      <div 
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-2xl text-zinc-300 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <span className="font-mono text-sm font-semibold text-zinc-100 tracking-wider uppercase">Quick Reference</span>
          <button 
            onClick={() => onClose(dontShowAgain)}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 -mr-1"
            title="Dismiss (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Shortcuts / Interaction Table */}
        <div className="py-3.5 space-y-2.5 text-sm">
          <div className="flex items-center justify-between py-2 px-3 rounded-md bg-zinc-900/60 border border-zinc-800/50">
            <div className="flex items-center gap-2.5 text-zinc-300">
              <MousePointer2 size={15} className="text-zinc-400" />
              <span>Add nodes</span>
            </div>
            <span className="font-mono text-xs text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded">Drag from left library</span>
          </div>

          <div className="flex items-center justify-between py-2 px-3 rounded-md bg-zinc-900/60 border border-zinc-800/50">
            <div className="flex items-center gap-2.5 text-zinc-300">
              <GitBranch size={15} className="text-zinc-400" />
              <span>Connect ports</span>
            </div>
            <span className="font-mono text-xs text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded">Drag output to input</span>
          </div>

          <div className="flex items-center justify-between py-2 px-3 rounded-md bg-zinc-900/60 border border-zinc-800/50">
            <div className="flex items-center gap-2.5 text-zinc-300">
              <Box size={15} className="text-zinc-400" />
              <span>3D Viewport</span>
            </div>
            <span className="font-mono text-xs text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded">Orbit / zoom mesh</span>
          </div>

          <div className="flex items-center justify-between py-2 px-3 rounded-md bg-zinc-900/60 border border-zinc-800/50">
            <div className="flex items-center gap-2.5 text-zinc-300">
              <FileCode size={15} className="text-zinc-400" />
              <span>GLSL 3.0</span>
            </div>
            <span className="font-mono text-xs text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded">Auto-compiled live</span>
          </div>
        </div>

        {/* Note */}
        <p className="text-xs text-zinc-500 font-mono py-1">
          Scalars and vectors (float ↔ vec2/3/4) cast automatically across connections.
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3.5 mt-1 border-t border-zinc-800/80">
          <label className="flex items-center gap-2 text-xs text-zinc-500 cursor-pointer select-none hover:text-zinc-400">
            <input 
              type="checkbox" 
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 accent-zinc-500 cursor-pointer"
            />
            <span>Don't show on start</span>
          </label>

          <button
            onClick={() => onClose(dontShowAgain)}
            className="px-4 py-1.5 bg-zinc-200 hover:bg-white text-zinc-900 text-xs font-semibold rounded-md transition-colors shadow-sm"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
