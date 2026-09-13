import type { ShaderIR, IRExpression, IRStatement, ShaderType } from './ir';
import { GLSL_LIBRARIES } from './glsl-utils';

const glslTypeName = (type: ShaderType): string => {
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

const formatFloat = (n: number): string => {
  return Number(n || 0).toFixed(5);
};

export const emitGlslExpr = (expr: IRExpression): string => {
  switch (expr.kind) {
    case 'literal': {
      if (expr.type === 'float') {
        return formatFloat(expr.value as number);
      }
      if (expr.type === 'vector2') {
        const v = Array.isArray(expr.value) ? expr.value : [expr.value, expr.value];
        return `vec2(${formatFloat(v[0])}, ${formatFloat(v[1])})`;
      }
      if (expr.type === 'vector3') {
        const v = Array.isArray(expr.value) ? expr.value : [expr.value, expr.value, expr.value];
        return `vec3(${formatFloat(v[0])}, ${formatFloat(v[1])}, ${formatFloat(v[2])})`;
      }
      if (expr.type === 'vector4') {
        const v = Array.isArray(expr.value) ? expr.value : [expr.value, expr.value, expr.value, expr.value];
        return `vec4(${formatFloat(v[0])}, ${formatFloat(v[1])}, ${formatFloat(v[2])}, ${formatFloat(v[3] !== undefined ? v[3] : 1)})`;
      }
      return String(expr.value);
    }

    case 'variable':
      return expr.name;

    case 'system_input': {
      switch (expr.name) {
        case 'uv':
          return 'v_uv';
        case 'time':
          return 'u_time';
        case 'resolution':
          return 'u_resolution';
        case 'mouse':
          return 'u_mouse';
        default:
          return '';
      }
    }

    case 'binary':
      return `${emitGlslExpr(expr.left)} ${expr.operator} ${emitGlslExpr(expr.right)}`;

    case 'unary':
      return `${expr.operator}(${emitGlslExpr(expr.operand)})`;

    case 'construct': {
      const typeName = glslTypeName(expr.type);
      const argsStr = expr.args.map(emitGlslExpr).join(', ');
      return `${typeName}(${argsStr})`;
    }

    case 'swizzle':
      return `${emitGlslExpr(expr.source)}.${expr.channels}`;

    case 'call': {
      const fn = expr.functionName;
      const args = expr.args.map(emitGlslExpr);
      switch (fn) {
        case 'interpolate':
          return `mix(${args[0]}, ${args[1]}, ${args[2]})`;
        case 'sine':
          return `sin(${args[0]})`;
        case 'cosine':
          return `cos(${args[0]})`;
        case 'power':
          return `pow(${args[0]}, ${args[1]})`;
        case 'dot_product':
          return `dot(${args[0]}, ${args[1]})`;
        case 'cross_product':
          return `cross(${args[0]}, ${args[1]})`;
        case 'normalize':
          return `normalize(${args[0]})`;
        case 'length':
          return `length(${args[0]})`;
        case 'fractional':
          return `fract(${args[0]})`;
        case 'absolute':
          return `abs(${args[0]})`;
        case 'minimum':
          return `min(${args[0]}, ${args[1]})`;
        case 'maximum':
          return `max(${args[0]}, ${args[1]})`;
        case 'clamp':
          return `clamp(${args[0]}, ${args[1]}, ${args[2]})`;
        case 'step':
          return `step(${args[0]}, ${args[1]})`;
        case 'smoothstep':
          return `smoothstep(${args[0]}, ${args[1]}, ${args[2]})`;
        case 'floor':
          return `floor(${args[0]})`;
        case 'modulo':
          return `mod(${args[0]}, ${args[1]})`;
        case 'atan2':
          return `atan(${args[0]}, ${args[1]})`;
        case 'snoise':
          return `snoise(${args[0]})`;
        case 'voronoi':
          return `voronoi(${args[0]})`;
        default:
          return `${fn}(${args.join(', ')})`;
      }
    }

    case 'cast': {
      const valStr = emitGlslExpr(expr.expr);
      const from = expr.fromType;
      const to = expr.toType;
      if (from === to) return valStr;

      if (to === 'float') {
        if (from === 'vector2' || from === 'vector3' || from === 'vector4') {
          return `${valStr}.x`;
        }
      }

      if (to === 'vector2') {
        if (from === 'float') return `vec2(${valStr})`;
        if (from === 'vector3' || from === 'vector4') return `${valStr}.xy`;
      }

      if (to === 'vector3') {
        if (from === 'float') return `vec3(${valStr})`;
        if (from === 'vector2') return `vec3(${valStr}, 0.0)`;
        if (from === 'vector4') return `${valStr}.xyz`;
      }

      if (to === 'vector4') {
        if (from === 'float') return `vec4(${valStr})`;
        if (from === 'vector2') return `vec4(${valStr}, 0.0, 1.0)`;
        if (from === 'vector3') return `vec4(${valStr}, 1.0)`;
      }

      return valStr;
    }

    default:
      return '';
  }
};

const emitGlslStatement = (stmt: IRStatement): string => {
  switch (stmt.kind) {
    case 'declare': {
      const typeStr = glslTypeName(stmt.type);
      if (stmt.initializer) {
        return `  ${typeStr} ${stmt.name} = ${emitGlslExpr(stmt.initializer)};\n`;
      }
      return `  ${typeStr} ${stmt.name};\n`;
    }
    case 'assign':
      return `  ${stmt.target} = ${emitGlslExpr(stmt.value)};\n`;
    case 'comment':
      return `  // ${stmt.text}\n`;
    default:
      return '';
  }
};

export const emitGlslFromIR = (ir: ShaderIR): string => {
  let mainBody = '';

  for (const block of ir.blocks) {
    let blockBody = `  // Node: ${block.nodeName} (${block.nodeId})\n`;
    for (const stmt of block.statements) {
      blockBody += emitGlslStatement(stmt);
    }
    mainBody += blockBody + '\n';
  }

  // Surface contract output
  const baseColorCode = emitGlslExpr(ir.surface.baseColor);
  const alphaCode = emitGlslExpr(ir.surface.alpha);
  mainBody += '  // Surface contract\n';
  mainBody += `  vec3 surface_baseColor = ${baseColorCode};\n`;
  mainBody += `  float surface_alpha = ${alphaCode};\n`;
  mainBody += '  fragColor = vec4(surface_baseColor, surface_alpha);\n';

  let fullCode =
    '#version 300 es\n' +
    'precision highp float;\n\n' +
    '// Uniforms\n' +
    'uniform float u_time;\n' +
    'uniform vec2 u_resolution;\n' +
    'uniform vec2 u_mouse;\n' +
    'uniform int u_frame;\n\n' +
    '// Standard varyings from quad\n' +
    'in vec2 v_uv;\n' +
    'out vec4 fragColor;\n\n' +
    '// Library Functions\n';

  ir.requiredLibraries.forEach(lib => {
    if (GLSL_LIBRARIES[lib]) {
      fullCode += GLSL_LIBRARIES[lib] + '\n';
    }
  });

  fullCode += '\nvoid main() {\n' + mainBody + '}\n';

  return fullCode;
};
