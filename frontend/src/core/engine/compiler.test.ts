import { describe, it, expect } from 'vitest';
import { transpileGraphToGLSL } from './compiler';
import type { GraphNode, GraphEdge } from './types';
import { NODE_REGISTRY } from '../nodes/registry';
import { SAMPLE_GRAPHS } from '../samples/samples';

describe('DAG Transpiler', () => {
  it('should compile a simple node graph without errors and map to unlit surface contract', () => {
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
    expect(result.glslCode).toContain('vec3 surface_baseColor = node_add1_out_out.rgb;');
    expect(result.glslCode).toContain('float surface_alpha = node_add1_out_out.a;');
    expect(result.glslCode).toContain('fragColor = vec4(surface_baseColor, surface_alpha);');
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

  it('should return error when masterOutput node is missing', () => {
    const nodes: GraphNode[] = [
      { id: 'add1', type: 'add', position: { x: 0, y: 0 }, data: {} }
    ];
    const result = transpileGraphToGLSL(nodes, [], 'master', NODE_REGISTRY);
    expect(result.error).toBe('Master Output node not found.');
  });

  it('should return error when an unknown node type is encountered', () => {
    const nodes: GraphNode[] = [
      { id: 'master', type: 'masterOutput', position: { x: 0, y: 0 }, data: {} },
      { id: 'unknown1', type: 'quantumDiscombobulator', position: { x: 0, y: 0 }, data: {} }
    ];
    const edges: GraphEdge[] = [
      { id: 'e1', source: 'unknown1', sourceHandle: 'out', target: 'master', targetHandle: 'color' }
    ];
    const result = transpileGraphToGLSL(nodes, edges, 'master', NODE_REGISTRY);
    expect(result.error).toContain('Unknown node type: quantumDiscombobulator');
  });

  it('should support automatic type casting between float, vec2, vec3, and vec4', () => {
    const nodes: GraphNode[] = [
      { id: 'master', type: 'masterOutput', position: { x: 0, y: 0 }, data: {} },
      { id: 'floatNode', type: 'floatConstant', position: { x: 0, y: 0 }, data: { val: 0.75 } }
    ];
    // Connecting float out to vec4 color on master
    const edges: GraphEdge[] = [
      { id: 'e1', source: 'floatNode', sourceHandle: 'out', target: 'master', targetHandle: 'color' }
    ];
    const result = transpileGraphToGLSL(nodes, edges, 'master', NODE_REGISTRY);
    expect(result.error).toBeUndefined();
    // vec4(node_floatNode_out_out)
    expect(result.glslCode).toContain('vec4(node_floatNode_out_out)');
  });

  it('should de-duplicate procedural library inclusions', () => {
    const nodes: GraphNode[] = [
      { id: 'master', type: 'masterOutput', position: { x: 0, y: 0 }, data: {} },
      { id: 'noise1', type: 'simplex2d', position: { x: 0, y: 0 }, data: {} },
      { id: 'noise2', type: 'simplex2d', position: { x: 0, y: 0 }, data: {} },
      { id: 'add1', type: 'add', position: { x: 0, y: 0 }, data: {} }
    ];
    const edges: GraphEdge[] = [
      { id: 'e1', source: 'noise1', sourceHandle: 'out', target: 'add1', targetHandle: 'a' },
      { id: 'e2', source: 'noise2', sourceHandle: 'out', target: 'add1', targetHandle: 'b' },
      { id: 'e3', source: 'add1', sourceHandle: 'out', target: 'master', targetHandle: 'color' }
    ];
    const result = transpileGraphToGLSL(nodes, edges, 'master', NODE_REGISTRY);
    expect(result.error).toBeUndefined();
    // Simplex noise definition appears exactly once
    const matches = result.glslCode.match(/float snoise\(vec2 v\)/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(1);
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
        expect(result.glslCode).toContain('surface_baseColor');
        expect(result.glslCode).toContain('surface_alpha');
      });
    });
  });

  describe('Animated Sample Templates (TASK-001)', () => {
    const animatedTemplateIds = [
      'rotating-checker-array',
      'drifting-voronoi-field',
      'pulse-gradient'
    ];

    animatedTemplateIds.forEach((sampleId) => {
      it(`should verify animated sample ${sampleId} contains reachable time node and emits u_time in GLSL`, () => {
        const sample = SAMPLE_GRAPHS.find(s => s.id === sampleId);
        expect(sample).toBeDefined();
        if (!sample) return;

        // Verify template has a time node
        const timeNode = sample.nodes.find(n => n.type === 'time');
        expect(timeNode).toBeDefined();
        expect(sample.nodes.some(n => n.id === 'master-node' && n.type === 'masterOutput')).toBe(true);

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
        expect(result.glslCode).toContain('u_time');
        // Verify that the time node's output is actually computed and declared
        const safeTimeId = timeNode!.id.replace(/-/g, '_');
        expect(result.glslCode).toContain(`node_${safeTimeId}_out_t = u_time;`);
      });
    });
  });
});
