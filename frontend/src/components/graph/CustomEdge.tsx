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
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{...style, strokeWidth: 3, stroke: '#888'}} />
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
            className="w-4 h-4 bg-primary border border-border text-text-muted hover:text-red-400 hover:border-red-400 rounded-full flex items-center justify-center text-[10px] cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
            onClick={onEdgeClick}
            title="Delete Connection"
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
