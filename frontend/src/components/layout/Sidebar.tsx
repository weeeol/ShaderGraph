import React, { DragEvent } from 'react';
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
    <aside className="w-64 bg-secondary border-r border-border h-full flex flex-col shrink-0 overflow-y-auto">
      <div className="p-3 border-b border-border bg-primary sticky top-0 z-10 shadow-md">
        <h3 className="text-sm font-semibold text-text">Node Library</h3>
        <p className="text-xs text-text-muted mt-1">Drag nodes into the workspace</p>
      </div>

      <div className="p-3 flex flex-col gap-4">
        {Object.entries(categories).map(([category, nodes]) => (
          nodes.length > 0 && (
            <div key={category} className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">{category}</h4>
              <div className="flex flex-col gap-2">
                {nodes.map((node) => (
                  <div
                    key={node.type}
                    className="p-2 border border-border bg-primary rounded cursor-grab hover:border-accent hover:bg-accent/10 transition-colors text-xs font-medium text-text flex items-center shadow-sm"
                    onDragStart={(event) => onDragStart(event, node.type)}
                    draggable
                  >
                    <div className="w-2 h-2 rounded-full bg-accent mr-2" />
                    {node.name}
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </aside>
  );
};
