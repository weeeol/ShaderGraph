import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { NODE_REGISTRY } from '../../core/nodes/registry';
import { useGraphStore } from '../../store/useGraphStore';
import type { DataType } from '../../core/engine/types';

export const CustomNode = memo(({ id, type, data, selected }: NodeProps) => {
  const updateNodeData = useGraphStore(state => state.updateNodeData);
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
        <input 
          type="number" 
          step="0.1"
          value={currentValue} 
          onChange={(e) => handleInputChange(portId, parseFloat(e.target.value) || 0)}
          className="w-16 bg-primary border border-border text-xs text-text p-1 rounded nodrag"
        />
      );
    }
    
    if (dataType === 'vec2' || dataType === 'vec3' || dataType === 'vec4') {
      const isColor = portId.toLowerCase().includes('color');
      if (isColor && dataType === 'vec4') {
        // Hex conversion logic could go here for an actual color picker
        return <div className="w-4 h-4 rounded-full bg-white border border-border nodrag"></div>;
      }
      
      const compCount = dataType === 'vec2' ? 2 : dataType === 'vec3' ? 3 : 4;
      const arr = Array.isArray(currentValue) ? currentValue : Array(compCount).fill(0);
      
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
              className="w-10 bg-primary border border-border text-xs text-text p-1 rounded nodrag text-center"
            />
          ))}
        </div>
      );
    }
    return null;
  };

  const isMaster = type === 'masterOutput';
  
  // Use simple string concatenation to avoid template literal escaping issues
  const outerClass = "min-w-[150px] bg-secondary rounded-lg border-2 shadow-lg flex flex-col " + (selected ? 'border-accent shadow-accent/20' : 'border-border');
  const innerClass = "px-3 py-2 border-b border-border rounded-t-md font-semibold text-xs flex items-center justify-between " + (isMaster ? 'bg-accent/20 text-accent' : 'bg-primary text-text');

  return (
    <div className={outerClass}>
      <div className={innerClass}>
        {def.name}
      </div>

      <div className="p-3 flex flex-col gap-3">
        {def.inputs.map((input, idx) => (
          <div key={input.id} className="relative flex items-center min-h-[24px]">
            <Handle 
              type="target" 
              position={Position.Left} 
              id={input.id}
              className="!w-3 !h-3 !-left-[22px] !bg-accent !border-2 !border-secondary"
            />
            <div className="flex justify-between items-center w-full gap-4">
              <span className="text-xs text-text-muted">{input.name}</span>
              {renderInputControl(input.id, input.type, input.defaultValue)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 pt-0 flex flex-col gap-3">
        {def.outputs.map((output, idx) => (
          <div key={output.id} className="relative flex items-center justify-end min-h-[24px]">
            <span className="text-xs text-text-muted">{output.name}</span>
            <Handle 
              type="source" 
              position={Position.Right} 
              id={output.id}
              className="!w-3 !h-3 !-right-[22px] !bg-accent !border-2 !border-secondary"
            />
          </div>
        ))}
      </div>
    </div>
  );
});
