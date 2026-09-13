import type { SemanticNodeDef } from './semanticOps';

export type DataType = 'float' | 'vec2' | 'vec3' | 'vec4' | 'sampler2D';

export interface PortDefinition {
  id: string;
  name: string;
  type: DataType;
  defaultValue?: any;
}

export interface NodeDefinition {
  id: string;
  type: string;
  name: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  semantic?: SemanticNodeDef;
  glslTemplate?: string; 
}

export interface GraphNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    [portId: string]: any;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

export interface UniformDefinition {
  name: string;
  type: DataType;
  value: any;
}

export interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  uniforms: Record<string, UniformDefinition>;
}
