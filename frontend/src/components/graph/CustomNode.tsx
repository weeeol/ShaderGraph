import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { NODE_REGISTRY } from '../../core/nodes/registry';
import { useGraphStore } from '../../store/useGraphStore';
import type { DataType } from '../../core/engine/types';

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

  const renderInputControl = (portId: string, dataType: DataType, defaultValue: any) => {
    const currentValue = data[portId] !== undefined ? data[portId] : defaultValue;
    
    if (dataType === 'float') {
      return (
        <div className="flex items-center gap-1">
          <input 
            type="number" 
            step="0.01"
            value={currentValue} 
            onChange={(e) => handleInputChange(portId, parseFloat(e.target.value) || 0)}
            className="w-16 bg-primary border border-border text-xs text-text p-1 rounded nodrag"
          />
        </div>
      );
    }
    
    if (dataType === 'vec2' || dataType === 'vec3' || dataType === 'vec4') {
      const isColor = portId.toLowerCase().includes('color') || portId.toLowerCase().includes('albedo');
      const compCount = dataType === 'vec2' ? 2 : dataType === 'vec3' ? 3 : 4;
      const arr = Array.isArray(currentValue) ? currentValue : Array(compCount).fill(0);
      
      if (isColor && (dataType === 'vec3' || dataType === 'vec4')) {
        const hex = rgbToHex(arr);
        return (
          <div className="flex flex-col gap-1 nodrag">
            <input 
              type="color" 
              value={hex}
              onChange={(e) => {
                const rgb = hexToRgb(e.target.value);
                if (dataType === 'vec4') {
                  handleInputChange(portId, [...rgb, arr[3] !== undefined ? arr[3] : 1.0]);
                } else {
                  handleInputChange(portId, rgb);
                }
              }}
              className="w-16 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
            />
            {dataType === 'vec4' && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-text-muted">A</span>
                <input 
                  type="range" 
                  min="0" max="1" step="0.01"
                  value={arr[3] !== undefined ? arr[3] : 1.0}
                  onChange={(e) => handleInputChange(portId, [arr[0], arr[1], arr[2], parseFloat(e.target.value)])}
                  className="w-12 h-1 bg-border rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>
        );
      }
      
      return (
        <div className="flex gap-1">
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
  
  const outerClass = "min-w-[160px] bg-secondary rounded-lg border-2 shadow-xl flex flex-col " + (selected ? 'border-accent shadow-accent/20' : 'border-border shadow-black/40');
  const innerClass = "px-3 py-2 border-b border-border rounded-t-md font-semibold text-xs flex items-center justify-between " + (isMaster ? 'bg-accent/20 text-accent' : 'bg-primary text-text');

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
        {def.inputs.map((input, idx) => (
          <div key={input.id} className="relative flex items-center min-h-[24px]">
            <Handle 
              type="target" 
              position={Position.Left} 
              id={input.id}
              className="!w-3 !h-3 !-left-[22px] !bg-accent !border-2 !border-secondary transition-transform hover:scale-125"
            />
            <div className="flex justify-between items-center w-full gap-4">
              <span className="text-xs text-text-muted font-medium">{input.name}</span>
              {renderInputControl(input.id, input.type, input.defaultValue)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 pt-0 flex flex-col gap-3">
        {def.outputs.map((output, idx) => (
          <div key={output.id} className="relative flex items-center justify-end min-h-[24px]">
            <span className="text-xs text-text-muted font-medium">{output.name}</span>
            <Handle 
              type="source" 
              position={Position.Right} 
              id={output.id}
              className="!w-3 !h-3 !-right-[22px] !bg-accent !border-2 !border-secondary transition-transform hover:scale-125"
            />
          </div>
        ))}
      </div>
    </div>
  );
});
