import { describe, it, expect } from 'vitest';
import { exportUnrealMaterial } from './unreal';
import { resolveGraphToShaderIR } from '../engine/resolveGraph';
import { SAMPLE_GRAPHS } from '../samples/samples';
import { NODE_REGISTRY } from '../nodes/registry';
import type { GraphNode, GraphEdge } from '../engine/types';

describe('Unreal Engine Custom Expression Exporter', () => {
  it('should generate paste-ready HLSL code body and setup markdown guide for static sample', () => {
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

    const artifact = exportUnrealMaterial(resolved.ir, sample.name);

    expect(artifact.target).toBe('unreal-material');
    expect(artifact.targetLabel).toBe('Unreal Engine (Custom Expression)');
    expect(artifact.files.length).toBe(2);

    const [hlslFile, setupFile] = artifact.files;
    expect(hlslFile.name).toBe('ShaderGraph_Unreal_CustomExpression.hlsl.txt');
    expect(setupFile.name).toBe('ShaderGraph_Unreal_Setup.md');

    // Verify code body contents
    const code = hlslFile.content;
    expect(code).toContain('// --- Unreal Custom Material Expression Code Body ---');
    expect(code).toContain('// Description: emerald_marble');
    expect(code).toContain('// Output Type: CMOT Float3');
    expect(code).toContain('Alpha = surface_alpha;');
    expect(code).toContain('return surface_baseColor;');

    // Helper struct for procedural noise in Unreal function-local scope
    expect(code).toContain('struct UE_Helpers {');
    expect(code).toContain('UE_Helpers::snoise(');

    // Verify absence of global include wrappers and GLSL tokens
    expect(code).not.toContain('#ifndef');
    expect(code).not.toContain('#define');
    expect(code).not.toContain('#version');
    expect(code).not.toContain('fragColor');
    expect(code).not.toContain('vec2');
    expect(code).not.toContain('vec3');
    expect(code).not.toContain('vec4');
    expect(code).not.toContain('mix(');
    expect(code).not.toContain('fract(');

    // Verify setup guide contents
    const setup = setupFile.content;
    expect(setup).toContain('CMOT Float3');
    expect(setup).toContain('Inputs [0]');
    expect(setup).toContain('UV');
    expect(setup).toContain('Inputs [1]');
    expect(setup).toContain('Time');
    expect(setup).toContain('Additional Outputs [0]');
    expect(setup).toContain('Alpha');
    expect(setup).toContain('CMOT Float1');
    expect(setup).toContain('Emissive Color');
    expect(setup).toContain('Constant Folding');

    // Verify instructions and warnings
    expect(artifact.instructions.some(s => s.includes('CMOT Float3'))).toBe(true);
    expect(artifact.instructions.some(s => s.includes('Emissive Color'))).toBe(true);
    expect(artifact.warnings.some(w => w.includes('Constant Folding'))).toBe(true);
    expect(artifact.warnings.some(w => w.includes('Blend Mode Dependency'))).toBe(true);
  });

  it('should generate valid Unreal HLSL body for animated sample utilizing Time input and fmod', () => {
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

    const artifact = exportUnrealMaterial(resolved.ir, sample.name);
    const code = artifact.files[0].content;

    // Must bind function Time parameter
    expect(code).toContain('= Time;');
    expect(code).not.toContain('u_time');
    expect(code).toContain('fmod(');
    expect(code).toContain('Alpha = surface_alpha;');
    expect(code).toContain('return surface_baseColor;');
  });

  it('should support voronoi noise in Unreal helper struct', () => {
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

    const artifact = exportUnrealMaterial(resolved.ir, sample.name);
    const code = artifact.files[0].content;

    expect(code).toContain('struct UE_Helpers {');
    expect(code).toContain('static float voronoi(float2 x)');
    expect(code).toContain('UE_Helpers::voronoi(');
  });
});
