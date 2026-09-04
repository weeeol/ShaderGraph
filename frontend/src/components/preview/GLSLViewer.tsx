import React from 'react';
import { useGraphStore } from '../../store/useGraphStore';

export const GLSLViewer = () => {
  const { glslCode } = useGraphStore();

  return (
    <div className="flex flex-col w-full h-64 bg-primary border-t border-border">
      <div className="p-2 border-b border-border bg-secondary flex justify-between items-center">
        <h3 className="text-xs font-semibold text-text-muted">Generated GLSL</h3>
        <button 
          className="text-xs bg-accent hover:bg-accent-hover text-white px-2 py-1 rounded"
          onClick={() => navigator.clipboard.writeText(glslCode)}
        >
          Copy
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 bg-primary">
        <pre className="text-xs font-mono text-text-muted">
          <code>{glslCode || '// Connect nodes to generate GLSL'}</code>
        </pre>
      </div>
    </div>
  );
};
