import type { GraphNode, GraphEdge, NodeDefinition } from './types';
import { resolveGraphToShaderIR } from './resolveGraph';
import { emitGlslFromIR } from './emitGlsl';
import type { ShaderIR, ShaderIRResult, ShaderType } from './ir';

export type { ShaderIR, ShaderIRResult, ShaderType };
export { resolveGraphToShaderIR } from './resolveGraph';
export { emitGlslFromIR } from './emitGlsl';

export interface CompilerResult {
  glslCode: string;
  error?: string;
}

export type NodeRegistry = Record<string, NodeDefinition>;

export const transpileGraphToGLSL = (
  nodes: GraphNode[],
  edges: GraphEdge[],
  masterOutputNodeId: string,
  nodeRegistry: NodeRegistry
): CompilerResult => {
  const resolved = resolveGraphToShaderIR(nodes, edges, masterOutputNodeId, nodeRegistry);
  if (!resolved.success) {
    return { glslCode: '', error: resolved.error };
  }

  const glslCode = emitGlslFromIR(resolved.ir);
  return { glslCode };
};
