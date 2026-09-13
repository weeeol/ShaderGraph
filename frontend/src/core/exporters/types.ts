import type { ShaderIR } from '../engine/ir';

export type ExportTarget = 'webgl-glsl' | 'unity-urp' | 'unity-hdrp' | 'unreal-material';

export interface GeneratedFile {
  name: string;
  content: string;
  mimeType: string;
}

export interface GeneratedArtifact {
  target: ExportTarget;
  targetLabel: string;
  files: GeneratedFile[];
  instructions: string[];
  warnings: string[];
}

export interface Exporter {
  target: ExportTarget;
  label: string;
  description: string;
  exportGraph: (ir: ShaderIR, graphName: string) => GeneratedArtifact;
}
