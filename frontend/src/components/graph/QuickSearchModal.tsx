import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, CornerDownLeft } from 'lucide-react';
import { NODE_REGISTRY } from '../../core/nodes/registry';

interface QuickSearchModalProps {
  isOpen: boolean;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onSelectNode: (nodeType: string) => void;
}

const CATEGORY_MAP: Record<string, { category: string; dot: string }> = {
  // Inputs
  uv: { category: 'Inputs', dot: 'bg-emerald-400' },
  time: { category: 'Inputs', dot: 'bg-emerald-400' },
  resolution: { category: 'Inputs', dot: 'bg-emerald-400' },
  mouse: { category: 'Inputs', dot: 'bg-emerald-400' },
  floatConstant: { category: 'Inputs', dot: 'bg-emerald-400' },
  colorConstant: { category: 'Inputs', dot: 'bg-emerald-400' },
  // Math
  add: { category: 'Math', dot: 'bg-cyan-400' },
  subtract: { category: 'Math', dot: 'bg-cyan-400' },
  multiply: { category: 'Math', dot: 'bg-cyan-400' },
  divide: { category: 'Math', dot: 'bg-cyan-400' },
  mix: { category: 'Math', dot: 'bg-cyan-400' },
  clamp: { category: 'Math', dot: 'bg-cyan-400' },
  step: { category: 'Math', dot: 'bg-cyan-400' },
  smoothstep: { category: 'Math', dot: 'bg-cyan-400' },
  sin: { category: 'Math', dot: 'bg-cyan-400' },
  cos: { category: 'Math', dot: 'bg-cyan-400' },
  power: { category: 'Math', dot: 'bg-cyan-400' },
  dot: { category: 'Math', dot: 'bg-cyan-400' },
  cross: { category: 'Math', dot: 'bg-cyan-400' },
  normalize: { category: 'Math', dot: 'bg-cyan-400' },
  length: { category: 'Math', dot: 'bg-cyan-400' },
  fract: { category: 'Math', dot: 'bg-cyan-400' },
  abs: { category: 'Math', dot: 'bg-cyan-400' },
  min: { category: 'Math', dot: 'bg-cyan-400' },
  max: { category: 'Math', dot: 'bg-cyan-400' },
  // Channels
  split: { category: 'Channel Ops', dot: 'bg-blue-400' },
  combine: { category: 'Channel Ops', dot: 'bg-blue-400' },
  // Procedural
  simplex2d: { category: 'Procedural', dot: 'bg-purple-400' },
  voronoi: { category: 'Procedural', dot: 'bg-purple-400' },
  checkerboard: { category: 'Procedural', dot: 'bg-purple-400' },
  // UV
  tileAndOffset: { category: 'UV Operations', dot: 'bg-teal-400' },
  polarCoords: { category: 'UV Operations', dot: 'bg-teal-400' },
  rotateUv: { category: 'UV Operations', dot: 'bg-teal-400' },
  // Filters
  invert: { category: 'Filters', dot: 'bg-amber-400' },
  contrast: { category: 'Filters', dot: 'bg-amber-400' }
};

export const QuickSearchModal = ({
  isOpen,
  position,
  onClose,
  onSelectNode
}: QuickSearchModalProps) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const availableNodes = useMemo(() => {
    return Object.values(NODE_REGISTRY).filter(n => n.type !== 'masterOutput');
  }, []);

  const filteredNodes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return availableNodes;
    return availableNodes.filter(n => {
      const cat = CATEGORY_MAP[n.type]?.category.toLowerCase() || '';
      return (
        n.name.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q) ||
        cat.includes(q)
      );
    });
  }, [availableNodes, query]);

  // Reset selection index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Ensure active element is scrolled into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredNodes.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredNodes.length) % Math.max(1, filteredNodes.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredNodes[selectedIndex]) {
        onSelectNode(filteredNodes[selectedIndex].type);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Compute popup coordinates to stay within window bounds
  const modalWidth = 320;
  const modalHeight = 380;
  let top = position ? position.y : window.innerHeight / 2 - modalHeight / 2;
  let left = position ? position.x : window.innerWidth / 2 - modalWidth / 2;

  if (position) {
    if (left + modalWidth > window.innerWidth - 20) {
      left = window.innerWidth - modalWidth - 20;
    }
    if (top + modalHeight > window.innerHeight - 20) {
      top = window.innerHeight - modalHeight - 20;
    }
    if (left < 20) left = 20;
    if (top < 20) top = 20;
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
      onContextMenu={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div 
        className="fixed bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        style={{
          top: `${top}px`,
          left: `${left}px`,
          width: `${modalWidth}px`,
          maxHeight: `${modalHeight}px`
        }}
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="p-2.5 border-b border-zinc-800 flex items-center gap-2 bg-zinc-950/60">
          <Search size={15} className="text-zinc-400 shrink-0 ml-1" />
          <input 
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type node name (Tab / Enter)..."
            className="flex-1 bg-transparent text-xs text-zinc-100 font-mono placeholder:text-zinc-500 focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-zinc-500 hover:text-zinc-300 p-0.5"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Nodes List */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto p-1.5 flex flex-col gap-0.5 custom-scrollbar max-h-[290px]"
        >
          {filteredNodes.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 font-mono">
              No matching nodes found
            </div>
          ) : (
            filteredNodes.map((node, idx) => {
              const isSelected = idx === selectedIndex;
              const catInfo = CATEGORY_MAP[node.type] || { category: 'Other', dot: 'bg-zinc-500' };
              const mainOutput = node.outputs[0]?.type || '';

              return (
                <div 
                  key={node.type}
                  onClick={() => {
                    onSelectNode(node.type);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors text-xs ${
                    isSelected 
                      ? 'bg-zinc-800 text-zinc-100 font-medium' 
                      : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${catInfo.dot}`} />
                    <span className="truncate font-sans font-medium text-[12.5px]">{node.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {catInfo.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {mainOutput && (
                      <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-zinc-950/80 border border-zinc-800 text-zinc-400">
                        {mainOutput}
                      </span>
                    )}
                    {isSelected && (
                      <CornerDownLeft size={11} className="text-zinc-400" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Hint */}
        <div className="px-3 py-1.5 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between text-[10px] font-mono text-zinc-500">
          <span>↑↓ Navigate</span>
          <span>↵ Insert</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  );
};
