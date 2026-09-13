import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { NODE_REGISTRY } from '../../core/nodes/registry';
import { useGraphStore } from '../../store/useGraphStore';

// Data type colors for industry standard socket representation
const TYPE_COLORS: Record<string, string> = {
  float: '#a1a1aa',  // Grey (scalar)
  vec2: '#38bdf8',   // Cyan / Sky
  vec3: '#facc15',   // Yellow / Amber
  vec4: '#c084fc',   // Purple / Violet
  sampler2D: '#f87171' // Red
};

const getCategoryMeta = (type: string) => {
  if (type === 'masterOutput') {
    return { tag: 'OUTPUT', dot: 'bg-amber-400', headerBorder: 'border-amber-500/50' };
  }
  if (['uv', 'time', 'resolution', 'mouse', 'floatConstant', 'colorConstant'].includes(type)) {
    return { tag: 'IN', dot: 'bg-emerald-400', headerBorder: 'border-emerald-500/30' };
  }
  if (['simplex2d', 'voronoi', 'checkerboard'].includes(type)) {
    return { tag: 'NOISE', dot: 'bg-purple-400', headerBorder: 'border-purple-500/30' };
  }
  if (['split', 'combine'].includes(type)) {
    return { tag: 'CHNL', dot: 'bg-blue-400', headerBorder: 'border-blue-500/30' };
  }
  if (['tileAndOffset', 'polarCoords', 'rotateUv', 'invert', 'contrast'].includes(type)) {
    return { tag: 'UV', dot: 'bg-teal-400', headerBorder: 'border-teal-500/30' };
  }
  return { tag: 'MATH', dot: 'bg-cyan-400', headerBorder: 'border-cyan-500/30' };
};

// Helper to convert normalized RGB array to Hex
const rgbToHex = (arr: number[]) => {
  const r = Math.round(Math.max(0, Math.min(1, arr[0] || 0)) * 255).toString(16).padStart(2, '0');
  const g = Math.round(Math.max(0, Math.min(1, arr[1] || 0)) * 255).toString(16).padStart(2, '0');
  const b = Math.round(Math.max(0, Math.min(1, arr[2] || 0)) * 255).toString(16).padStart(2, '0');
  return '#' + r + g + b;
};

// Helper to convert Hex string to normalized RGB array
const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
};

export const CustomNode = memo(({ id, type, data, selected }: NodeProps) => {
  const updateNodeData = useGraphStore(state => state.updateNodeData);
  const deleteNode = useGraphStore(state => state.deleteNode);
  const def = NODE_REGISTRY[type];

  if (!def) {
    return (
      <div className="px-3 py-2 bg-red-950 border border-red-800 rounded-lg text-xs text-red-200 font-mono">
        Unknown Node: {type}
      </div>
    );
  }

  const isMaster = type === 'masterOutput';
  const category = getCategoryMeta(type);

  const handleInputChange = (portId: string, val: any) => {
    updateNodeData(id, portId, val);
  };

  const renderInputControl = (input: any) => {
    const portId = input.id;
    const dataType = input.type;
    const currentValue = data[portId] !== undefined ? data[portId] : input.defaultValue;
    
    if (dataType === 'float') {
      return (
        <input 
          type="number"
          step="0.1"
          value={currentValue}
          onChange={(e) => handleInputChange(portId, parseFloat(e.target.value) || 0)}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="w-16 bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs px-2 py-0.5 rounded focus:border-zinc-500 outline-none ml-auto text-right nodrag nopan"
        />
      );
    }
    
    if (dataType === 'vec2' || dataType === 'vec3' || dataType === 'vec4') {
      const isColor = portId.toLowerCase().includes('color') || portId.toLowerCase().includes('albedo') || input.id === 'val';
      const compCount = dataType === 'vec2' ? 2 : dataType === 'vec3' ? 3 : 4;
      const arr = Array.isArray(currentValue) ? currentValue : Array(compCount).fill(0);
      
      if (isColor && (dataType === 'vec3' || dataType === 'vec4')) {
        const colorHex = rgbToHex(arr);
        const isVec4 = dataType === 'vec4';
        const alpha = arr[3] !== undefined ? arr[3] : 1.0;
        
        const handleColorChange = (e: any, mode: 'hex' | 'alpha') => {
          if (mode === 'hex') {
            const rgb = hexToRgb(e.target.value);
            handleInputChange(portId, isVec4 ? [...rgb, alpha] : rgb);
          } else {
            handleInputChange(portId, [arr[0], arr[1], arr[2], parseFloat(e.target.value)]);
          }
        };

        return (
          <div 
            className="flex items-center gap-2 ml-auto nodrag nopan"
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div 
              className="w-5 h-5 rounded border border-zinc-700 shrink-0 cursor-pointer overflow-hidden relative shadow-sm nodrag nopan"
              style={{ backgroundColor: colorHex }}
            >
              <input 
                type="color" 
                value={colorHex}
                onChange={e => handleColorChange(e, 'hex')}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full nodrag nopan"
              />
            </div>
            <span className="text-xs font-mono text-zinc-400 uppercase">{colorHex}</span>
            {isVec4 && (
              <input 
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={alpha}
                onChange={e => handleColorChange(e, 'alpha')}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-14 h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-zinc-300 nodrag nopan"
                title={`Alpha: ${alpha.toFixed(2)}`}
              />
            )}
          </div>
        );
      }
      
      return (
        <div 
          className="flex gap-1 ml-auto nodrag nopan"
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {arr.slice(0, compCount).map((v: number, i: number) => (
            <input 
              key={i}
              type="number" 
              step="0.1"
              value={v} 
              onChange={(e) => {
                const newArr = [...arr];
                newArr[i] = parseFloat(e.target.value) || 0;
                handleInputChange(portId, newArr);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="w-11 bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-200 px-1 py-0.5 rounded text-center focus:border-zinc-500 outline-none nodrag nopan"
            />
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      className={`min-w-[195px] bg-zinc-900 border rounded-lg shadow-lg flex flex-col transition-all duration-150 ${
        selected 
          ? 'border-zinc-300 ring-1 ring-zinc-300/40 shadow-xl' 
          : 'border-zinc-800 hover:border-zinc-700/80'
      }`}
    >
      {/* Node Header */}
      <div className={`px-3 py-1.5 bg-zinc-950 border-b flex items-center justify-between rounded-t-lg ${category.headerBorder}`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${category.dot}`} />
          <span className="font-semibold text-xs text-zinc-100 tracking-tight truncate">{def.name}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <span className="text-[9px] font-mono font-medium px-1 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase">
            {category.tag}
          </span>
          {!isMaster && (
            <button 
              onClick={() => deleteNode(id)}
              className="w-4 h-4 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors text-xs leading-none"
              title="Delete Node"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Sockets Container */}
      <div className="px-3 py-2.5 flex flex-col gap-2">
        {/* Input Sockets */}
        {def.inputs.map((input) => {
          const color = TYPE_COLORS[input.type] || '#a1a1aa';
          return (
            <div key={input.id} className="relative flex items-center h-5.5">
              <Handle
                type="target"
                position={Position.Left}
                id={input.id}
                className="w-2.5 h-2.5 border border-zinc-900 rounded-full transition-transform hover:scale-125"
                style={{ 
                  left: -17, 
                  backgroundColor: color,
                  boxShadow: `0 0 0 2px #18181b` 
                }}
              />
              <div className="text-xs font-medium text-zinc-300 flex items-center gap-2 w-full">
                <span className="font-mono text-xs text-zinc-300 shrink-0">{input.name}</span>
                <span className="text-[9.5px] font-mono text-zinc-500 uppercase">{input.type}</span>
                {renderInputControl(input)}
              </div>
            </div>
          );
        })}

        {/* Output Sockets */}
        {def.outputs.map((output) => {
          const color = TYPE_COLORS[output.type] || '#a1a1aa';
          return (
            <div key={output.id} className="relative flex items-center justify-end h-5.5">
              <div className="text-xs font-medium flex items-center gap-1.5 mr-1">
                <span className="text-[9.5px] font-mono text-zinc-500 uppercase">{output.type}</span>
                <span className="font-mono text-xs text-zinc-300">{output.name}</span>
              </div>
              <Handle
                type="source"
                position={Position.Right}
                id={output.id}
                className="w-2.5 h-2.5 border border-zinc-900 rounded-full transition-transform hover:scale-125"
                style={{ 
                  right: -17, 
                  backgroundColor: color,
                  boxShadow: `0 0 0 2px #18181b` 
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});
