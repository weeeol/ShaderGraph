import type { Exporter, ExportTarget } from './types';
import { exportUnityUrp, exportUnityHdrp } from './unity';
import { exportWebGL } from './webgl';

export const EXPORTER_REGISTRY: Record<ExportTarget, Exporter> = {
  'unity-urp': {
    target: 'unity-urp',
    label: 'URP (Shader Graph)',
    description: 'Unity Universal Render Pipeline Unlit Custom Function HLSL include.',
    exportGraph: exportUnityUrp
  },
  'unity-hdrp': {
    target: 'unity-hdrp',
    label: 'HDRP (Shader Graph)',
    description: 'Unity High Definition Render Pipeline Unlit Custom Function HLSL include.',
    exportGraph: exportUnityHdrp
  },
  'webgl-glsl': {
    target: 'webgl-glsl',
    label: 'WebGL2 (GLSL ES)',
    description: 'Portable WebGL2 fragment shader code for Three.js and custom engines.',
    exportGraph: exportWebGL
  },
  'unreal-material': {
    target: 'unreal-material',
    label: 'Unreal Engine (Custom Expression)',
    description: 'Unreal Engine Material Custom Expression HLSL (Coming in TASK-006).',
    exportGraph: exportUnityUrp // Placeholder for TASK-006
  }
};

export const AVAILABLE_TARGETS: ExportTarget[] = ['unity-urp', 'unity-hdrp', 'webgl-glsl'];
