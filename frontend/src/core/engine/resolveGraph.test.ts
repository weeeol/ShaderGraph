import { describe, it, expect } from 'vitest';
import { resolveGraphToShaderIR } from './resolveGraph';
import { emitGlslFromIR } from './emitGlsl';
import type { GraphNode, GraphEdge } from './types';
import { NODE_REGISTRY } from '../nodes/registry';

describe('Graph Resolver & Shader IR', () => {
  it('should resolve a simple graph to a valid, target-neutral Shader IR', () => {
    const nodes: GraphNode[] = [
      { id: 'master', type: 'masterOutput', position: { x: 0, y: 0 }, data: {} },
      { id: 'add1', type: 'add', position: { x: 0, y: 0 }, data: { a: 1.5, b: 2.0 } }
    ];
    const edges: GraphEdge[] = [
      { id: 'e1', source: 'add1', sourceHandle: 'out', target: 'master', targetHandle: 'color' }
    ];

    const result = resolveGraphToShaderIR(nodes, edges, 'master', NODE_REGISTRY);

    expect(result.success).toBe(true);
    if (!result.success) return;

    const ir = result.ir;
    expect(ir.version).toBe('1.0');
    expect(ir.blocks.length).toBe(2);

    // Unlit surface contract
    expect(ir.surface.baseColor.type).toBe('vector3');
    expect(ir.surface.alpha.type).toBe('float');

    // Verify target-neutral types and ops: no GLSL or HLSL language tokens in types
    const irJson = JSON.stringify(ir);
    expect(irJson).not.toContain('"vec4"');
    expect(irJson).not.toContain('"float4"');
    expect(irJson).not.toContain('"mix"');
    expect(irJson).not.toContain('"lerp"');
  });

  it('should be deterministic: resolving identical graphs produces identical IR', () => {
    const nodes: GraphNode[] = [
      { id: 'master', type: 'masterOutput', position: { x: 0, y: 0 }, data: {} },
      { id: 'uv1', type: 'uv', position: { x: 0, y: 0 }, data: {} },
      { id: 'noise1', type: 'simplex2d', position: { x: 0, y: 0 }, data: { scale: 4.0 } }
    ];
    const edges: GraphEdge[] = [
      { id: 'e1', source: 'uv1', sourceHandle: 'uv', target: 'noise1', targetHandle: 'uv' },
      { id: 'e2', source: 'noise1', sourceHandle: 'out', target: 'master', targetHandle: 'color' }
    ];

    const res1 = resolveGraphToShaderIR(nodes, edges, 'master', NODE_REGISTRY);
    const res2 = resolveGraphToShaderIR(nodes, edges, 'master', NODE_REGISTRY);

    expect(res1.success).toBe(true);
    expect(res2.success).toBe(true);
    if (res1.success && res2.success) {
      expect(JSON.stringify(res1.ir)).toBe(JSON.stringify(res2.ir));
    }
  });

  it('should return error when masterOutput is not in nodes', () => {
    const nodes: GraphNode[] = [
      { id: 'add1', type: 'add', position: { x: 0, y: 0 }, data: {} }
    ];
    const result = resolveGraphToShaderIR(nodes, [], 'master', NODE_REGISTRY);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Master Output node not found.');
    }
  });

  it('should detect cycles and return a clear error without generating partial IR', () => {
    const nodes: GraphNode[] = [
      { id: 'master', type: 'masterOutput', position: { x: 0, y: 0 }, data: {} },
      { id: 'a', type: 'add', position: { x: 0, y: 0 }, data: {} },
      { id: 'b', type: 'add', position: { x: 0, y: 0 }, data: {} }
    ];
    const edges: GraphEdge[] = [
      { id: 'e1', source: 'a', sourceHandle: 'out', target: 'master', targetHandle: 'color' },
      { id: 'e2', source: 'b', sourceHandle: 'out', target: 'a', targetHandle: 'a' },
      { id: 'e3', source: 'a', sourceHandle: 'out', target: 'b', targetHandle: 'a' }
    ];
    const result = resolveGraphToShaderIR(nodes, edges, 'master', NODE_REGISTRY);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Cycle detected in graph.');
    }
  });

  it('should validate invalid input port handles', () => {
    const nodes: GraphNode[] = [
      { id: 'master', type: 'masterOutput', position: { x: 0, y: 0 }, data: {} },
      { id: 'a', type: 'add', position: { x: 0, y: 0 }, data: {} }
    ];
    const edges: GraphEdge[] = [
      { id: 'e1', source: 'a', sourceHandle: 'out', target: 'master', targetHandle: 'nonExistentPort' }
    ];
    const result = resolveGraphToShaderIR(nodes, edges, 'master', NODE_REGISTRY);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Invalid input port 'nonExistentPort'");
    }
  });

  it('should validate missing source output port handles', () => {
    const nodes: GraphNode[] = [
      { id: 'master', type: 'masterOutput', position: { x: 0, y: 0 }, data: {} },
      { id: 'a', type: 'add', position: { x: 0, y: 0 }, data: {} }
    ];
    const edges: GraphEdge[] = [
      { id: 'e1', source: 'a', sourceHandle: 'badSourcePort', target: 'master', targetHandle: 'color' }
    ];
    const result = resolveGraphToShaderIR(nodes, edges, 'master', NODE_REGISTRY);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Missing source port 'badSourcePort'");
    }
  });

  it('should validate unknown node types', () => {
    const nodes: GraphNode[] = [
      { id: 'master', type: 'masterOutput', position: { x: 0, y: 0 }, data: {} },
      { id: 'fake', type: 'nonExistentNodeType', position: { x: 0, y: 0 }, data: {} }
    ];
    const edges: GraphEdge[] = [
      { id: 'e1', source: 'fake', sourceHandle: 'out', target: 'master', targetHandle: 'color' }
    ];
    const result = resolveGraphToShaderIR(nodes, edges, 'master', NODE_REGISTRY);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Unknown node type: nonExistentNodeType');
    }
  });

  it('should validate incompatible sampler2D connections', () => {
    const fakeRegistry = {
      ...NODE_REGISTRY,
      fakeSampler: {
        id: 'fakeSampler',
        type: 'fakeSampler',
        name: 'Fake Sampler',
        inputs: [],
        outputs: [{ id: 'tex', name: 'Tex', type: 'sampler2D' as const }],
        semantic: { type: 'constant' as const }
      }
    };
    const nodes: GraphNode[] = [
      { id: 'master', type: 'masterOutput', position: { x: 0, y: 0 }, data: {} },
      { id: 'sampler1', type: 'fakeSampler', position: { x: 0, y: 0 }, data: {} }
    ];
    const edges: GraphEdge[] = [
      // Connecting sampler2D out to vec4 color on master
      { id: 'e1', source: 'sampler1', sourceHandle: 'tex', target: 'master', targetHandle: 'color' }
    ];
    const result = resolveGraphToShaderIR(nodes, edges, 'master', fakeRegistry as any);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Incompatible connection between sampler2D and vec4');
    }
  });

  it('should allow emitting resolved IR to GLSL without re-traversing React Flow data', () => {
    const nodes: GraphNode[] = [
      { id: 'master', type: 'masterOutput', position: { x: 0, y: 0 }, data: {} },
      { id: 'inv1', type: 'invert', position: { x: 0, y: 0 }, data: { val: 0.2 } }
    ];
    const edges: GraphEdge[] = [
      { id: 'e1', source: 'inv1', sourceHandle: 'out', target: 'master', targetHandle: 'color' }
    ];

    const result = resolveGraphToShaderIR(nodes, edges, 'master', NODE_REGISTRY);
    expect(result.success).toBe(true);
    if (!result.success) return;

    // Emitting from the resolved IR directly
    const glsl = emitGlslFromIR(result.ir);
    expect(glsl).toContain('#version 300 es');
    expect(glsl).toContain('1.00000 - 0.20000');
    expect(glsl).toContain('surface_baseColor');
    expect(glsl).toContain('surface_alpha');
  });
});
