import { describe, it, expect } from 'vitest';
import { emitHlslFromIR, sanitizeGraphName } from './emitHlsl';
import type { ShaderIR } from './ir';

describe('HLSL Emitter', () => {
  it('should sanitize graph names deterministically', () => {
    expect(sanitizeGraphName('Emerald Marble')).toBe('emerald_marble');
    expect(sanitizeGraphName('Rotating Checker Array #1')).toBe('rotating_checker_array_1');
    expect(sanitizeGraphName('___test___')).toBe('test');
    expect(sanitizeGraphName('')).toBe('shader_graph');
  });

  it('should emit valid Unity include guard and exact public function signature', () => {
    const ir: ShaderIR = {
      version: '1.0',
      systemInputs: new Set(['uv', 'time']),
      requiredLibraries: new Set([]),
      blocks: [],
      surface: {
        baseColor: { kind: 'literal', type: 'vector3', value: [1.0, 0.5, 0.2] },
        alpha: { kind: 'literal', type: 'float', value: 1.0 }
      }
    };

    const code = emitHlslFromIR(ir, 'Emerald Marble');

    expect(code).toContain('//UNITY_SHADER_NO_UPGRADE');
    expect(code).toContain('#ifndef SHADERGRAPH_EMERALD_MARBLE_INCLUDED');
    expect(code).toContain('#define SHADERGRAPH_EMERALD_MARBLE_INCLUDED');
    expect(code).toContain('void ShaderGraphSurface_float(');
    expect(code).toContain('float2 UV,');
    expect(code).toContain('float Time,');
    expect(code).toContain('out float3 BaseColor,');
    expect(code).toContain('out float Alpha');
    expect(code).toContain('BaseColor = surface_baseColor;');
    expect(code).toContain('Alpha = surface_alpha;');
    expect(code).toContain('#endif // SHADERGRAPH_EMERALD_MARBLE_INCLUDED');
  });

  it('should lower target-neutral calls into HLSL intrinsics (lerp, frac, fmod, atan2)', () => {
    const ir: ShaderIR = {
      version: '1.0',
      systemInputs: new Set(['uv', 'time']),
      requiredLibraries: new Set([]),
      blocks: [
        {
          nodeId: 'n1',
          nodeType: 'mix',
          nodeName: 'Mix',
          statements: [
            {
              kind: 'declare',
              type: 'vector4',
              name: 'out1'
            },
            {
              kind: 'assign',
              target: 'out1',
              value: {
                kind: 'call',
                type: 'vector4',
                functionName: 'interpolate',
                args: [
                  { kind: 'literal', type: 'vector4', value: [0, 0, 0, 1] },
                  { kind: 'literal', type: 'vector4', value: [1, 1, 1, 1] },
                  { kind: 'literal', type: 'float', value: 0.5 }
                ]
              }
            },
            {
              kind: 'declare',
              type: 'float',
              name: 'f1'
            },
            {
              kind: 'assign',
              target: 'f1',
              value: {
                kind: 'call',
                type: 'float',
                functionName: 'fractional',
                args: [{ kind: 'system_input', type: 'float', name: 'time' }]
              }
            },
            {
              kind: 'declare',
              type: 'float',
              name: 'm1'
            },
            {
              kind: 'assign',
              target: 'm1',
              value: {
                kind: 'call',
                type: 'float',
                functionName: 'modulo',
                args: [
                  { kind: 'variable', type: 'float', name: 'f1' },
                  { kind: 'literal', type: 'float', value: 2.0 }
                ]
              }
            }
          ]
        }
      ],
      surface: {
        baseColor: {
          kind: 'swizzle',
          type: 'vector3',
          source: { kind: 'variable', type: 'vector4', name: 'out1' },
          channels: 'xyz'
        },
        alpha: { kind: 'literal', type: 'float', value: 1.0 }
      }
    };

    const code = emitHlslFromIR(ir, 'Test Lerp');

    expect(code).toContain('lerp(');
    expect(code).not.toContain('mix(');
    expect(code).toContain('frac(Time)');
    expect(code).not.toContain('fract(');
    expect(code).toContain('fmod(f1, 2.00000)');
    expect(code).not.toMatch(/[^f]mod\(/);
    expect(code).toContain('float4 out1;');
    expect(code).not.toContain('vec4');
  });

  it('should include HLSL procedural libraries when requested', () => {
    const ir: ShaderIR = {
      version: '1.0',
      systemInputs: new Set(['uv']),
      requiredLibraries: new Set(['simplex2d', 'voronoi']),
      blocks: [],
      surface: {
        baseColor: { kind: 'literal', type: 'vector3', value: [0, 0, 0] },
        alpha: { kind: 'literal', type: 'float', value: 1.0 }
      }
    };

    const code = emitHlslFromIR(ir, 'Noise Graph');

    expect(code).toContain('float sg_snoise(float2 v)');
    expect(code).toContain('float sg_voronoi(float2 x)');
    expect(code).toContain('float3 sg_mod289(float3 x)');
  });
});
