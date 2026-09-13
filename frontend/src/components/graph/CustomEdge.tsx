import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';
import { useGraphStore } from '../../store/useGraphStore';
import { NODE_REGISTRY } from '../../core/nodes/registry';

const DARK_TYPE_COLORS: Record<string, string> = {
  float: '#a1a1aa',
  vec2: '#38bdf8',
  vec3: '#facc15',
  vec4: '#c084fc',
  sampler2D: '#f87171',
};

const LIGHT_TYPE_COLORS: Record<string, string> = {
  float: '#52525e',
  vec2: '#0284c7',
  vec3: '#b45309',
  vec4: '#7e22ce',
  sampler2D: '#dc2626',
};

export const CustomEdge = ({
  id,
  source,
  sourceHandleId,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const nodes = useGraphStore(state => state.nodes);
  const theme = useGraphStore(state => state.theme);
  const onEdgesChange = useGraphStore(state => state.onEdgesChange);

  // Resolve source port data type to apply semantic wire coloring
  const sourceNode = nodes.find(n => n.id === source);
  const sourceDef = sourceNode?.type ? NODE_REGISTRY[sourceNode.type] : undefined;
  const sourcePort = sourceDef?.outputs.find((o: { id: string; type: string }) => o.id === (sourceHandleId || 'out') || o.id === sourceHandleId)
    || sourceDef?.outputs[0];
  const portType = sourcePort?.type;

  const wireColor = selected
    ? (theme === 'light' ? '#0f0f14' : '#f4f4f5')
    : (theme === 'light'
        ? (LIGHT_TYPE_COLORS[portType || ''] || '#8e8e99')
        : (DARK_TYPE_COLORS[portType || ''] || '#71717a'));

  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    onEdgesChange([{ type: 'remove', id }]);
  };

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{ 
          ...style, 
          strokeWidth: selected ? 2.5 : 2, 
          stroke: wireColor,
          strokeOpacity: selected ? 1 : 0.85,
          transition: 'stroke 0.15s ease, stroke-width 0.15s ease, stroke-opacity 0.15s ease'
        }} 
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan group flex items-center justify-center p-3 cursor-pointer"
        >
          <button
            className="w-5 h-5 bg-zinc-900 border border-zinc-700/80 hover:border-red-500/80 text-zinc-400 hover:text-red-400 rounded-full flex items-center justify-center text-xs cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all shadow-md active:scale-90"
            onClick={onEdgeClick}
            title="Disconnect Wire"
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
