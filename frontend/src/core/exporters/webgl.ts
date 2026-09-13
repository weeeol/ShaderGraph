import type { ShaderIR } from '../engine/ir';
import { emitGlslFromIR } from '../engine/emitGlsl';
import { sanitizeGraphName } from '../engine/emitHlsl';
import type { GeneratedArtifact } from './types';

export const exportWebGL = (ir: ShaderIR, graphName = 'shader_graph'): GeneratedArtifact => {
  const cleanName = sanitizeGraphName(graphName);
  const fileName = `${cleanName}.frag.glsl`;
  const glslCode = emitGlslFromIR(ir);

  return {
    target: 'webgl-glsl',
    targetLabel: 'WebGL2 (GLSL ES 3.00)',
    files: [
      {
        name: fileName,
        content: glslCode,
        mimeType: 'text/plain'
      }
    ],
    instructions: [
      `Save '${fileName}' as your WebGL2 fragment shader.`,
      'Bind a full-screen quad or 3D mesh with standard UV attribute (in vec2 v_uv).',
      'Provide standard uniforms: u_time (float), u_resolution (vec2), u_mouse (vec2).',
      'In Three.js, pass to THREE.RawShaderMaterial with vertexShader supplying v_uv.'
    ],
    warnings: [
      'Requires WebGL2 / OpenGL ES 3.00 context support (#version 300 es).',
      'Unlit fragment output bound to out vec4 fragColor.'
    ]
  };
};
