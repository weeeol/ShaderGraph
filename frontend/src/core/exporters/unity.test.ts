import { describe, it, expect } from 'vitest';
import { exportUnityUrp, exportUnityHdrp } from './unity';
import { resolveGraphToShaderIR } from '../engine/resolveGraph';
import { SAMPLE_GRAPHS } from '../samples/samples';
import { NODE_REGISTRY } from '../nodes/registry';
import type { GraphNode, GraphEdge } from '../engine/types';

describe('Unity Exporters (URP & HDRP)', () => {
  it('should generate valid URP artifact with exact function signature and include guard', () => {
    const sample = SAMPLE_GRAPHS.find(s => s.id === 'emerald-marble')!;
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

    const resolved = resolveGraphToShaderIR(graphNodes, graphEdges, 'master-node', NODE_REGISTRY);
    expect(resolved.success).toBe(true);
    if (!resolved.success) return;

    const artifact = exportUnityUrp(resolved.ir, sample.name);

    expect(artifact.target).toBe('unity-urp');
    expect(artifact.targetLabel).toBe('Unity URP (Shader Graph)');
    expect(artifact.files.length).toBe(1);

    const file = artifact.files[0];
    expect(file.name).toBe('emerald_marble.hlsl');
    expect(file.content).toContain('//UNITY_SHADER_NO_UPGRADE');
    expect(file.content).toContain('#ifndef SHADERGRAPH_EMERALD_MARBLE_INCLUDED');
    expect(file.content).toContain('void ShaderGraphSurface_float(');
    expect(file.content).toContain('float2 UV,');
    expect(file.content).toContain('float Time,');
    expect(file.content).toContain('out float3 BaseColor,');
    expect(file.content).toContain('out float Alpha');
    expect(file.content).toContain('BaseColor = surface_baseColor;');
    expect(file.content).toContain('Alpha = surface_alpha;');

    // Verify zero GLSL-specific tokens
    expect(file.content).not.toContain('vec2');
    expect(file.content).not.toContain('vec3');
    expect(file.content).not.toContain('vec4');
    expect(file.content).not.toContain('mix(');
    expect(file.content).not.toContain('fract(');
    expect(file.content).not.toContain('fragColor');
    expect(file.content).not.toContain('#version');

    // Verify instructions and warnings
    expect(artifact.instructions.length).toBeGreaterThanOrEqual(4);
    expect(artifact.instructions.some(s => s.includes('ShaderGraphSurface'))).toBe(true);
    expect(artifact.warnings.some(w => w.includes('Unlit Surface Contract only'))).toBe(true);
  });

  it('should generate valid HDRP artifact with HDRP instructions and warnings', () => {
    const sample = SAMPLE_GRAPHS.find(s => s.id === 'drifting-voronoi-field')!;
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

    const resolved = resolveGraphToShaderIR(graphNodes, graphEdges, 'master-node', NODE_REGISTRY);
    expect(resolved.success).toBe(true);
    if (!resolved.success) return;

    const artifact = exportUnityHdrp(resolved.ir, sample.name);

    expect(artifact.target).toBe('unity-hdrp');
    expect(artifact.targetLabel).toBe('Unity HDRP (Shader Graph)');
    expect(artifact.files[0].name).toBe('drifting_voronoi_field.hlsl');
    expect(artifact.instructions.some(s => s.includes('HDRP'))).toBe(true);
    expect(artifact.warnings.some(w => w.includes('HDRP'))).toBe(true);
    expect(artifact.files[0].content).toContain('sg_voronoi(');
  });

  it('should export animated template (rotating-checker-array) correctly utilizing Time parameter', () => {
    const sample = SAMPLE_GRAPHS.find(s => s.id === 'rotating-checker-array')!;
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

    const resolved = resolveGraphToShaderIR(graphNodes, graphEdges, 'master-node', NODE_REGISTRY);
    expect(resolved.success).toBe(true);
    if (!resolved.success) return;

    const artifact = exportUnityUrp(resolved.ir, sample.name);
    const content = artifact.files[0].content;

    // Must bind function Time parameter
    expect(content).toContain('= Time;');
    expect(content).not.toContain('u_time');
    expect(content).toContain('fmod(');
  });
});
