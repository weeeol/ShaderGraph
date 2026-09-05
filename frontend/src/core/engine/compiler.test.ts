import { describe, it, expect } from 'vitest';
import { transpileGraphToGLSL } from './compiler';
import type { GraphNode, GraphEdge } from './types';
import { NODE_REGISTRY } from '../nodes/registry';
import { SAMPLE_GRAPHS } from '../samples/samples';

describe('DAG Transpiler', () => {
  it('should compile a simple node graph without errors', () => {
    const nodes: GraphNode[] = [
      { id: 'master', type: 'masterOutput', position: { x: 0, y: 0 }, data: {} },
      { id: 'add1', type: 'add', position: { x: 0, y: 0 }, data: { a: 1.5, b: 2.0 } }
    ];
    
    const edges: GraphEdge[] = [
      { id: 'e1', source: 'add1', sourceHandle: 'out', target: 'master', targetHandle: 'color' }
    ];

    const result = transpileGraphToGLSL(nodes, edges, 'master', NODE_REGISTRY);
    
    expect(result.error).toBeUndefined();
    expect(result.glslCode).toContain('vec4 node_add1_out_out;');
    expect(result.glslCode).toContain('node_add1_out_out = vec4(1.50000, 1.50000, 1.50000, 1.50000) + vec4(2.00000, 2.00000, 2.00000, 2.00000);');
    expect(result.glslCode).toContain('fragColor = node_add1_out_out;');
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

    const result = transpileGraphToGLSL(nodes, edges, 'master', NODE_REGISTRY);
    expect(result.error).toBe('Cycle detected in graph.');
  });

  describe('Sample Graphs Compilation', () => {
    SAMPLE_GRAPHS.forEach((sample) => {
      it(`should successfully compile ${sample.name}`, () => {
        const graphNodes: GraphNode[] = sample.nodes.map(n => ({
          id: n.id,
          type: n.type || '',
          position: n.position,
          data: n.data as any
        }));

        const graphEdges: GraphEdge[] = sample.edges.map(e => ({
          id: e.id,
          source: e.source,
          sourceHandle: e.sourceHandle || '',
          target: e.target,
          targetHandle: e.targetHandle || ''
        }));

        const result = transpileGraphToGLSL(graphNodes, graphEdges, 'master-node', NODE_REGISTRY);
        expect(result.error).toBeUndefined();
        expect(result.glslCode).toContain('#version 300 es');
        expect(result.glslCode).toContain('fragColor =');
      });
    });
  });
});
