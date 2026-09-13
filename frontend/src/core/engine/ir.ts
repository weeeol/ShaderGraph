import type { DataType } from './types';

export type ShaderType = 'float' | 'vector2' | 'vector3' | 'vector4' | 'sampler2D';

export const dataTypeToShaderType = (type: DataType): ShaderType => {
  switch (type) {
    case 'float':
      return 'float';
    case 'vec2':
      return 'vector2';
    case 'vec3':
      return 'vector3';
    case 'vec4':
      return 'vector4';
    case 'sampler2D':
      return 'sampler2D';
    default:
      return 'float';
  }
};

export const shaderTypeToDataType = (type: ShaderType): DataType => {
  switch (type) {
    case 'float':
      return 'float';
    case 'vector2':
      return 'vec2';
    case 'vector3':
      return 'vec3';
    case 'vector4':
      return 'vec4';
    case 'sampler2D':
      return 'sampler2D';
    default:
      return 'float';
  }
};

// --- IR EXPRESSIONS ---

export interface IRLiteral {
  kind: 'literal';
  type: ShaderType;
  value: number | number[];
}

export interface IRVariable {
  kind: 'variable';
  type: ShaderType;
  name: string;
}

export interface IRSystemInput {
  kind: 'system_input';
  type: ShaderType;
  name: 'uv' | 'time' | 'resolution' | 'mouse';
}

export interface IRBinaryOp {
  kind: 'binary';
  type: ShaderType;
  operator: '+' | '-' | '*' | '/' | '%' | '<' | '>' | '<=' | '>=' | '==' | '!=';
  left: IRExpression;
  right: IRExpression;
}

export interface IRUnaryOp {
  kind: 'unary';
  type: ShaderType;
  operator: '-' | '!';
  operand: IRExpression;
}

export interface IRConstructor {
  kind: 'construct';
  type: ShaderType;
  args: IRExpression[];
}

export interface IRSwizzle {
  kind: 'swizzle';
  type: ShaderType;
  source: IRExpression;
  channels: string; // e.g. 'x', 'y', 'z', 'w', 'xy', 'xyz', 'rgb', 'a'
}

export interface IRCall {
  kind: 'call';
  type: ShaderType;
  functionName: string;
  args: IRExpression[];
}

export interface IRCast {
  kind: 'cast';
  type: ShaderType;
  fromType: ShaderType;
  toType: ShaderType;
  expr: IRExpression;
}

export type IRExpression =
  | IRLiteral
  | IRVariable
  | IRSystemInput
  | IRBinaryOp
  | IRUnaryOp
  | IRConstructor
  | IRSwizzle
  | IRCall
  | IRCast;

// --- IR STATEMENTS ---

export interface IRDeclare {
  kind: 'declare';
  type: ShaderType;
  name: string;
  initializer?: IRExpression;
}

export interface IRAssign {
  kind: 'assign';
  target: string;
  value: IRExpression;
}

export interface IRComment {
  kind: 'comment';
  text: string;
}

export type IRStatement = IRDeclare | IRAssign | IRComment;

export interface IRNodeBlock {
  nodeId: string;
  nodeType: string;
  nodeName: string;
  statements: IRStatement[];
}

// --- UNLIT SURFACE CONTRACT ---

export interface UnlitSurfaceContract {
  baseColor: IRExpression; // 3-component color (vector3)
  alpha: IRExpression;     // scalar opacity (float)
  uv?: IRExpression;       // 2-component uv (vector2)
  time?: IRExpression;     // scalar time (float)
}

// --- ROOT SHADER IR ---

export interface ShaderIR {
  version: '1.0';
  systemInputs: Set<'uv' | 'time' | 'resolution' | 'mouse'>;
  requiredLibraries: Set<'simplex2d' | 'voronoi'>;
  blocks: IRNodeBlock[];
  surface: UnlitSurfaceContract;
}

export type ShaderIRResult =
  | { success: true; ir: ShaderIR }
  | { success: false; error: string; errorNodeId?: string };
