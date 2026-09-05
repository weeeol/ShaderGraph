import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';
import { useGraphStore } from '../../store/useGraphStore';

export const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgesChange = useGraphStore(state => state.onEdgesChange);

  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    onEdgesChange([{ type: 'remove', id }]);
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: 2, stroke: '#71717a' }} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button
            className="w-5 h-5 bg-zinc-900 border border-zinc-700 hover:border-red-500/60 text-zinc-400 hover:text-red-400 rounded-full flex items-center justify-center text-xs cursor-pointer opacity-0 hover:opacity-100 transition-opacity shadow-md"
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
