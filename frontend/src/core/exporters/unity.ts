import type { ShaderIR } from '../engine/ir';
import { emitHlslFromIR, sanitizeGraphName } from '../engine/emitHlsl';
import type { GeneratedArtifact } from './types';

const COMMON_WARNINGS = [
  'Unlit Surface Contract only: Lit and PBR material channels (Normal, Metallic, Smoothness, Emission) are not supported in this export.',
  'Shader Graph Custom Function nodes cannot inject render passes, configure blend/depth states, or modify vertex geometry.',
  'Texture asset samplers are not bound in v1 export. Only procedural math, UV ops, noise, and vector operations are portable.',
  'Mouse and Resolution inputs are not passed into Custom Functions in v1 and evaluate to zero/fallback defaults.'
];

export const exportUnityUrp = (ir: ShaderIR, graphName = 'shader_graph'): GeneratedArtifact => {
  const cleanName = sanitizeGraphName(graphName);
  const fileName = `${cleanName}.hlsl`;
  const hlslCode = emitHlslFromIR(ir, cleanName);

  return {
    target: 'unity-urp',
    targetLabel: 'Unity URP (Shader Graph)',
    files: [
      {
        name: fileName,
        content: hlslCode,
        mimeType: 'text/plain'
      }
    ],
    instructions: [
      `Save '${fileName}' into your Unity project Assets folder (e.g. Assets/Shaders/${fileName}).`,
      'Create or open an Unlit Shader Graph in your project (Universal Target > Unlit).',
      'Press Spacebar and add a Custom Function node.',
      `In the Graph Inspector for the Custom Function node, set Type to 'File', assign Source to '${fileName}', and set Name to 'ShaderGraphSurface'.`,
      'Configure Inputs on the node: add "UV" (Vector 2) and connect to a UV node; add "Time" (Float) and connect to a Time node (Time output).',
      'Configure Outputs on the node: add "BaseColor" (Vector 3) and connect to Base Color on Master Stack; add "Alpha" (Float) and connect to Alpha on Master Stack.'
    ],
    warnings: [
      ...COMMON_WARNINGS,
      'URP Pipeline: To use transparency, ensure the Shader Graph Graph Settings are configured with Surface Type set to Transparent or Alpha Clipping enabled.'
    ]
  };
};

export const exportUnityHdrp = (ir: ShaderIR, graphName = 'shader_graph'): GeneratedArtifact => {
  const cleanName = sanitizeGraphName(graphName);
  const fileName = `${cleanName}.hlsl`;
  const hlslCode = emitHlslFromIR(ir, cleanName);

  return {
    target: 'unity-hdrp',
    targetLabel: 'Unity HDRP (Shader Graph)',
    files: [
      {
        name: fileName,
        content: hlslCode,
        mimeType: 'text/plain'
      }
    ],
    instructions: [
      `Save '${fileName}' into your Unity project Assets folder (e.g. Assets/Shaders/${fileName}).`,
      'Create or open an Unlit Shader Graph in your HDRP project (Target: HDRP > Unlit).',
      'Press Spacebar and add a Custom Function node.',
      `In the Graph Inspector for the Custom Function node, set Type to 'File', assign Source to '${fileName}', and set Name to 'ShaderGraphSurface'.`,
      'Configure Inputs on the node: add "UV" (Vector 2) and connect to a UV node; add "Time" (Float) and connect to a Time node (Time output).',
      'Configure Outputs on the node: add "BaseColor" (Vector 3) and connect to Base Color on HDRP Master Stack; add "Alpha" (Float) and connect to Alpha on HDRP Master Stack.'
    ],
    warnings: [
      ...COMMON_WARNINGS,
      'HDRP Pipeline: HDRP custom passes, raytracing shaders, and distortion passes require native HDRP master node configurations and cannot be driven by custom functions.'
    ]
  };
};
