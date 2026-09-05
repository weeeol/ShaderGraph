import { useState } from 'react';
import type { DragEvent } from 'react';
import { Search, X, GripVertical } from 'lucide-react';
import { NODE_REGISTRY } from '../../core/nodes/registry';

const CATEGORY_CONFIG: Record<string, { types: string[]; dot: string }> = {
  'Inputs': {
    types: ['uv', 'time', 'resolution', 'mouse', 'floatConstant', 'colorConstant'],
    dot: 'bg-emerald-400'
  },
  'Math': {
    types: ['add', 'subtract', 'multiply', 'divide', 'mix', 'clamp', 'step', 'smoothstep', 'sin', 'cos', 'power', 'dot', 'cross', 'normalize', 'length', 'fract', 'abs', 'min', 'max'],
    dot: 'bg-cyan-400'
  },
  'Channel Ops': {
    types: ['split', 'combine'],
    dot: 'bg-blue-400'
  },
  'Procedural': {
    types: ['simplex2d', 'voronoi', 'checkerboard'],
    dot: 'bg-purple-400'
  },
  'UV Operations': {
    types: ['tileAndOffset', 'polarCoords', 'rotateUv'],
    dot: 'bg-teal-400'
  },
  'Filters': {
    types: ['invert', 'contrast'],
    dot: 'bg-amber-400'
  }
};

export const Sidebar = () => {
  const [search, setSearch] = useState('');

  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const availableNodes = Object.values(NODE_REGISTRY).filter(n => n.type !== 'masterOutput');

  const filteredNodes = search.trim()
    ? availableNodes.filter(n => 
        n.name.toLowerCase().includes(search.toLowerCase()) || 
        n.type.toLowerCase().includes(search.toLowerCase())
      )
    : availableNodes;

  return (
    <div className="w-full bg-zinc-950 border-r border-zinc-800/80 flex flex-col h-full shrink-0 z-10">
      {/* Palette Header & Search */}
      <div className="p-3.5 border-b border-zinc-800/80 bg-zinc-900/30 shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Node Library
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            {availableNodes.length} NODES
          </span>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-zinc-500" />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nodes..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 pl-8 pr-7 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 transition-colors font-mono placeholder:text-zinc-600"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-2 top-2 text-zinc-500 hover:text-zinc-300"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Nodes List */}
      <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-4 custom-scrollbar">
        {Object.entries(CATEGORY_CONFIG).map(([category, config]) => {
          const categoryNodes = filteredNodes.filter(n => config.types.includes(n.type));
          if (categoryNodes.length === 0) return null;

          return (
            <div key={category}>
              <div className="flex items-center gap-1.5 mb-1.5 px-1">
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  {category}
                </h3>
              </div>

              <div className="flex flex-col gap-1">
                {categoryNodes.map(node => {
                  const mainOutput = node.outputs[0]?.type || '';
                  return (
                    <div 
                      key={node.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, node.type)}
                      className="bg-zinc-900/60 hover:bg-zinc-800/90 border border-zinc-800/70 hover:border-zinc-700 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-200 cursor-grab active:cursor-grabbing flex items-center justify-between transition-colors group select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <GripVertical size={13} className="text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
                        <span>{node.name}</span>
                      </div>
                      {mainOutput && (
                        <span className="text-[10px] font-mono text-zinc-500 uppercase shrink-0">
                          {mainOutput}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredNodes.length === 0 && (
          <div className="text-center py-8 text-xs text-zinc-500">
            No matching nodes for "{search}"
          </div>
        )}
      </div>
    </div>
  );
};
