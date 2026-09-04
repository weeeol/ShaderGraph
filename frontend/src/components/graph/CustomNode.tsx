import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { NODE_REGISTRY } from '../../core/nodes/registry';
import { useGraphStore } from '../../store/useGraphStore';


// Helper to convert normalized RGB array to Hex
const rgbToHex = (arr: number[]) => {
  const r = Math.round(Math.max(0, Math.min(1, arr[0] || 0)) * 255).toString(16).padStart(2, '0');
  const g = Math.round(Math.max(0, Math.min(1, arr[1] || 0)) * 255).toString(16).padStart(2, '0');
  const b = Math.round(Math.max(0, Math.min(1, arr[2] || 0)) * 255).toString(16).padStart(2, '0');
  return "#" + r + g + b;
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
    return <div className="p-2 bg-red-900 border border-red-500 rounded text-xs text-white">Unknown Type: {type}</div>;
  }

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
          className="w-12 bg-primary/50 border border-border/50 text-text text-[10px] px-1 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent ml-auto shadow-inner"
        />
      );
    }
    
    if (dataType === 'vec2' || dataType === 'vec3' || dataType === 'vec4') {
      const isColor = portId.toLowerCase().includes('color') || portId.toLowerCase().includes('albedo');
      const compCount = dataType === 'vec2' ? 2 : dataType === 'vec3' ? 3 : 4;
      const arr = Array.isArray(currentValue) ? currentValue : Array(compCount).fill(0);
      
      if (isColor && (dataType === 'vec3' || dataType === 'vec4')) {
        const colorHex = rgbToHex(arr);
        const isVec4 = dataType === 'vec4';
        const alpha = arr[3] !== undefined ? arr[3] : 1.0;
        
        const handleColorChange = (e: any, type: 'hex' | 'alpha') => {
          if (type === 'hex') {
            const rgb = hexToRgb(e.target.value);
            handleInputChange(portId, isVec4 ? [...rgb, alpha] : rgb);
          } else {
            handleInputChange(portId, [arr[0], arr[1], arr[2], parseFloat(e.target.value)]);
          }
        };

        return (
          <div className="flex flex-col gap-1 w-full ml-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-5 h-5 rounded-full border border-border shadow-inner shrink-0 cursor-pointer overflow-hidden relative ring-1 ring-black/20"
                style={{ backgroundColor: colorHex }}
              >
                <input 
                  type="color" 
                  value={colorHex}
                  onChange={e => handleColorChange(e, 'hex')}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
              <span className="text-[9px] font-mono opacity-50 uppercase">{colorHex}</span>
            </div>
            {isVec4 && (
              <input 
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={alpha}
                onChange={e => handleColorChange(e, 'alpha')}
                className="w-16 h-1 mt-1 bg-primary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-text-muted [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-accent transition-all"
                title={`Alpha: ${alpha.toFixed(2)}`}
              />
            )}
          </div>
        );
      }
      
      return (
        <div className="flex gap-1 ml-auto">
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
              className="w-10 bg-primary border border-border text-xs text-text p-1 rounded nodrag text-center focus:border-accent outline-none transition-colors"
            />
          ))}
        </div>
      );
    }
    return null;
  };

  const isMaster = type === 'masterOutput';
  
  const outerClass = `min-w-[160px] bg-secondary rounded-xl border border-border shadow-xl flex flex-col transition-all duration-200 ${
    selected 
      ? 'ring-2 ring-accent/60 shadow-[0_0_15px_rgba(99,102,241,0.3)] border-transparent' 
      : 'hover:border-accent/30'
  }`;

  const innerClass = `px-3 py-2 border-b border-border/50 rounded-t-xl font-semibold text-xs tracking-wide flex items-center justify-between ${
    isMaster 
      ? 'bg-gradient-to-r from-accent/20 to-accent/5 text-accent' 
      : 'bg-primary/50 text-text'
  }`;

  return (
    <div className={outerClass}>
      <div className={innerClass}>
        <span>{def.name}</span>
        {!isMaster && (
          <button 
            onClick={() => deleteNode(id)}
            className="w-4 h-4 rounded-full flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
            title="Delete Node"
          >
            ×
          </button>
        )}
      </div>

      <div className="p-3 flex flex-col gap-3">
        {def.inputs.map((input) => (
          <div key={input.id} className="relative flex items-center h-6">
            <Handle
              type="target"
              position={Position.Left}
              id={input.id}
              className={`w-3 h-3 border-2 border-secondary bg-primary hover:bg-accent hover:border-accent transition-colors`}
              style={{ left: -18, top: '50%' }}
            />
            <div className="text-[11px] font-medium text-text-muted flex items-center gap-2 w-full">
              <span className="shrink-0">{input.name}</span>
              {renderInputControl(input)}
            </div>
          </div>
        ))}

        {def.outputs.map((output) => (
          <div key={output.id} className="relative flex items-center justify-end h-6">
            <span className="text-[11px] font-medium text-text-muted">{output.name}</span>
            <Handle
              type="source"
              position={Position.Right}
              id={output.id}
              className={`w-3 h-3 border-2 border-secondary bg-primary hover:bg-accent hover:border-accent transition-colors`}
              style={{ right: -18, top: '50%' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
});
