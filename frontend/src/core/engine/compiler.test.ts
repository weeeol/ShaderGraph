import { describe, it, expect } from 'vitest';
import { transpileGraphToGLSL } from './compiler';
import type { GraphNode, GraphEdge } from './types';

import { NODE_REGISTRY as mockRegistry } from '../nodes/registry';

describe('DAG Transpiler', () => {
  it('should compile a simple node graph without errors', () => {
    const nodes: GraphNode[] = [
      { id: 'master', type: 'masterOutput', position: { x: 0, y: 0 }, data: {} },
      { id: 'add1', type: 'add', position: { x: 0, y: 0 }, data: { a: 1.5, b: 2.0 } }
    ];
    
    const edges: GraphEdge[] = [
      { id: 'e1', source: 'add1', sourceHandle: 'out', target: 'master', targetHandle: 'color' }
    ];

    const result = transpileGraphToGLSL(nodes, edges, 'master', mockRegistry);
    
    expect(result.error).toBeUndefined();
    expect(result.glslCode).toContain('float node_add1_out_out;');
    expect(result.glslCode).toContain('node_add1_out_out = 1.50000 + 2.00000;');
    expect(result.glslCode).toContain('fragColor = vec4(node_add1_out_out);'); // due to vec4 cast
  });

  it('should detect cycles', () => {
    const nodes: GraphNode[] = [
      { id: 'master', type: 'masterOutput', position: { x: 0, y: 0 }, data: {} },
      { id: 'add1', type: 'add', position: { x: 0, y: 0 }, data: {} },
      { id: 'add2', type: 'add', position: { x: 0, y: 0 }, data: {} }
    ];
    
    const edges: GraphEdge[] = [
      { id: 'e1', source: 'add1', sourceHandle: 'out', target: 'master', targetHandle: 'color' },
      { id: 'e2', source: 'add2', sourceHandle: 'out', target: 'add1', targetHandle: 'a' },
      { id: 'e3', source: 'add1', sourceHandle: 'out', target: 'add2', targetHandle: 'a' } // cycle
    ];

    const result = transpileGraphToGLSL(nodes, edges, 'master', mockRegistry);
    expect(result.error).toBe('Cycle detected in graph.');
  });
});
