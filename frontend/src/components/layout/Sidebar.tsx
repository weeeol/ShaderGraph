import type { DragEvent } from 'react';
import { NODE_REGISTRY } from '../../core/nodes/registry';

export const Sidebar = () => {
  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Group nodes by some internal logic or just list them
  // For simplicity, we'll exclude masterOutput
  const availableNodes = Object.values(NODE_REGISTRY).filter(n => n.type !== 'masterOutput');

  // Basic categorization based on type prefix or manual mapping could be done here, 
  // but listing them alphabetically or sequentially is fine for now.
  const categories: Record<string, typeof availableNodes> = {
    'Inputs': availableNodes.filter(n => ['uv', 'time', 'resolution', 'mouse', 'vector', 'float'].includes(n.type)),
    'Math': availableNodes.filter(n => ['add', 'subtract', 'multiply', 'divide', 'mix', 'clamp', 'step', 'smoothstep', 'sin', 'cos', 'power', 'dot', 'cross', 'normalize', 'length', 'fract', 'abs', 'min', 'max'].includes(n.type)),
    'Channel Ops': availableNodes.filter(n => ['split', 'combine'].includes(n.type)),
    'Procedural': availableNodes.filter(n => ['valueNoise', 'simplex2d', 'voronoi', 'checkerboard'].includes(n.type)),
    'UV Operations': availableNodes.filter(n => ['tileAndOffset', 'polarCoords', 'rotateUv'].includes(n.type)),
    'Filters': availableNodes.filter(n => ['invert', 'contrast', 'normalFromHeight'].includes(n.type)),
  };

  return (
    <div className="w-full bg-secondary/95 backdrop-blur-md border-r border-border flex flex-col h-full shrink-0 z-10">
      <div className="p-4 border-b border-border/50">
        <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Node Library
        </h2>
        <div className="relative">
          <svg className="w-4 h-4 absolute left-2.5 top-2.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text"
            placeholder="Search nodes..."
            className="w-full bg-primary border border-border rounded-md py-1.5 pl-9 pr-3 text-xs text-text focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-shadow shadow-inner placeholder:text-text-muted/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar">
        {Object.entries(categories).map(([category, nodes]) => (
          nodes.length > 0 && (
            <div key={category}>
              <h3 className="text-[10px] font-semibold text-text-muted mb-2 uppercase tracking-wider">{category}</h3>
              <div className="flex flex-col gap-1.5">
                {nodes.map(node => (
                  <div 
                    key={node.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, node.type)}
                    className="bg-primary/50 border border-border/40 hover:border-accent/40 rounded-md px-3 py-2 text-xs font-medium text-text cursor-grab active:cursor-grabbing hover:-translate-y-[1px] hover:shadow-lg hover:shadow-accent/5 hover:bg-primary transition-all duration-200"
                  >
                    {node.name}
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};
