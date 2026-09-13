import type { ShaderIR, IRExpression, IRStatement, ShaderType } from './ir';

const hlslTypeName = (type: ShaderType): string => {
  switch (type) {
    case 'float':
      return 'float';
    case 'vector2':
      return 'float2';
    case 'vector3':
      return 'float3';
    case 'vector4':
      return 'float4';
    case 'sampler2D':
      throw new Error('sampler2D is not supported in Custom HLSL export v1.');
    default:
      return 'float';
  }
};

const formatFloat = (n: number): string => {
  return Number(n || 0).toFixed(5);
};

export interface HlslEmitOptions {
  libraryPrefix?: string;
  indent?: string;
}

export const emitHlslExpr = (expr: IRExpression, options?: HlslEmitOptions): string => {
  const libPrefix = options?.libraryPrefix ?? 'sg_';

  switch (expr.kind) {
    case 'literal': {
      if (expr.type === 'float') {
        return formatFloat(expr.value as number);
      }
      if (expr.type === 'vector2') {
        const v = Array.isArray(expr.value) ? expr.value : [expr.value, expr.value];
        return `float2(${formatFloat(v[0])}, ${formatFloat(v[1])})`;
      }
      if (expr.type === 'vector3') {
        const v = Array.isArray(expr.value) ? expr.value : [expr.value, expr.value, expr.value];
        return `float3(${formatFloat(v[0])}, ${formatFloat(v[1])}, ${formatFloat(v[2])})`;
      }
      if (expr.type === 'vector4') {
        const v = Array.isArray(expr.value) ? expr.value : [expr.value, expr.value, expr.value, expr.value];
        return `float4(${formatFloat(v[0])}, ${formatFloat(v[1])}, ${formatFloat(v[2])}, ${formatFloat(v[3] !== undefined ? v[3] : 1)})`;
      }
      return String(expr.value);
    }

    case 'variable':
      return expr.name;

    case 'system_input': {
      switch (expr.name) {
        case 'uv':
          return 'UV';
        case 'time':
          return 'Time';
        case 'resolution':
          return 'float2(1920.0, 1080.0)';
        case 'mouse':
          return 'float2(0.0, 0.0)';
        default:
          return '';
      }
    }

    case 'binary':
      return `${emitHlslExpr(expr.left, options)} ${expr.operator} ${emitHlslExpr(expr.right, options)}`;

    case 'unary':
      return `${expr.operator}(${emitHlslExpr(expr.operand, options)})`;

    case 'construct': {
      const typeName = hlslTypeName(expr.type);
      const argsStr = expr.args.map(a => emitHlslExpr(a, options)).join(', ');
      return `${typeName}(${argsStr})`;
    }

    case 'swizzle':
      return `${emitHlslExpr(expr.source, options)}.${expr.channels}`;

    case 'call': {
      const fn = expr.functionName;
      const args = expr.args.map(a => emitHlslExpr(a, options));
      switch (fn) {
        case 'interpolate':
          return `lerp(${args[0]}, ${args[1]}, ${args[2]})`;
        case 'fractional':
          return `frac(${args[0]})`;
        case 'modulo':
          return `fmod(${args[0]}, ${args[1]})`;
        case 'atan2':
          return `atan2(${args[0]}, ${args[1]})`;
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
        case 'snoise':
          return `${libPrefix}snoise(${args[0]})`;
        case 'voronoi':
          return `${libPrefix}voronoi(${args[0]})`;
        default:
          return `${fn}(${args.join(', ')})`;
      }
    }

    case 'cast': {
      const valStr = emitHlslExpr(expr.expr, options);
      const from = expr.fromType;
      const to = expr.toType;
      if (from === to) return valStr;

      if (to === 'float') {
        if (from === 'vector2' || from === 'vector3' || from === 'vector4') {
          return `${valStr}.x`;
        }
      }

      if (to === 'vector2') {
        if (from === 'float') return `float2(${valStr}, ${valStr})`;
        if (from === 'vector3' || from === 'vector4') return `${valStr}.xy`;
      }

      if (to === 'vector3') {
        if (from === 'float') return `float3(${valStr}, ${valStr}, ${valStr})`;
        if (from === 'vector2') return `float3(${valStr}, 0.0)`;
        if (from === 'vector4') return `${valStr}.xyz`;
      }

      if (to === 'vector4') {
        if (from === 'float') return `float4(${valStr}, ${valStr}, ${valStr}, 1.0)`;
        if (from === 'vector2') return `float4(${valStr}, 0.0, 1.0)`;
        if (from === 'vector3') return `float4(${valStr}, 1.0)`;
      }

      return valStr;
    }

    default:
      return '';
  }
};

const emitHlslStatement = (stmt: IRStatement, options?: HlslEmitOptions): string => {
  const ind = options?.indent ?? '    ';
  switch (stmt.kind) {
    case 'declare': {
      const typeStr = hlslTypeName(stmt.type);
      if (stmt.initializer) {
        return `${ind}${typeStr} ${stmt.name} = ${emitHlslExpr(stmt.initializer, options)};\n`;
      }
      return `${ind}${typeStr} ${stmt.name};\n`;
    }
    case 'assign':
      return `${ind}${stmt.target} = ${emitHlslExpr(stmt.value, options)};\n`;
    case 'comment':
      return `${ind}// ${stmt.text}\n`;
    default:
      return '';
  }
};

const HLSL_LIBRARIES = {
  simplex2d: `// --- Simplex 2D Noise ---
float3 sg_mod289(float3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
float2 sg_mod289(float2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
float3 sg_permute(float3 x) { return sg_mod289(((x * 34.0) + 1.0) * x); }

float sg_snoise(float2 v) {
    const float4 C = float4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
    float2 i = floor(v + dot(v, C.yy));
    float2 x0 = v - i + dot(i, C.xx);
    float2 i1;
    i1 = (x0.x > x0.y) ? float2(1.0, 0.0) : float2(0.0, 1.0);
    float4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = sg_mod289(i);
    float3 p = sg_permute(sg_permute(i.y + float3(0.0, i1.y, 1.0))
        + i.x + float3(0.0, i1.x, 1.0));
    float3 m = max(0.5 - float3(dot(x0, x0), dot(x12.xy, x12.xy),
        dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    float3 x = 2.0 * frac(p * C.www) - 1.0;
    float3 h = abs(x) - 0.5;
    float3 ox = floor(x + 0.5);
    float3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    float3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}
`,
  voronoi: `// --- Voronoi Noise ---
float2 sg_random2(float2 p) {
    return frac(sin(float2(dot(p, float2(127.1, 311.7)), dot(p, float2(269.5, 183.3)))) * 43758.5453);
}

float sg_voronoi(float2 x) {
    float2 n = floor(x);
    float2 f = frac(x);
    float m = 8.0;
    for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
            float2 g = float2(float(i), float(j));
            float2 o = sg_random2(n + g);
            float2 r = g - f + o;
            float d = dot(r, r);
            m = min(m, d);
        }
    }
    return sqrt(m);
}
`
};

export const sanitizeGraphName = (name: string): string => {
  const sanitized = name.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  return sanitized || 'shader_graph';
};

export const emitHlslFromIR = (ir: ShaderIR, graphName = 'shader_graph'): string => {
  const cleanName = sanitizeGraphName(graphName);
  const guardName = `SHADERGRAPH_${cleanName.toUpperCase()}_INCLUDED`;

  let librarySection = '';
  ir.requiredLibraries.forEach(lib => {
    if (HLSL_LIBRARIES[lib]) {
      librarySection += HLSL_LIBRARIES[lib] + '\n';
    }
  });

  let mainBody = '';
  for (const block of ir.blocks) {
    let blockBody = `    // Node: ${block.nodeName} (${block.nodeId})\n`;
    for (const stmt of block.statements) {
      blockBody += emitHlslStatement(stmt);
    }
    mainBody += blockBody + '\n';
  }

  const baseColorCode = emitHlslExpr(ir.surface.baseColor);
  const alphaCode = emitHlslExpr(ir.surface.alpha);
  mainBody += '    // Surface contract output\n';
  mainBody += `    float3 surface_baseColor = ${baseColorCode};\n`;
  mainBody += `    float surface_alpha = ${alphaCode};\n`;
  mainBody += '    BaseColor = surface_baseColor;\n';
  mainBody += '    Alpha = surface_alpha;\n';

  let code = `//UNITY_SHADER_NO_UPGRADE
#ifndef ${guardName}
#define ${guardName}

${librarySection}
void ShaderGraphSurface_float(
    float2 UV,
    float Time,
    out float3 BaseColor,
    out float Alpha
)
{
${mainBody}}

#endif // ${guardName}
`;

  return code;
};

export const emitUnrealCustomExpression = (ir: ShaderIR, graphName = 'shader_graph'): string => {
  const cleanName = sanitizeGraphName(graphName);
  const options: HlslEmitOptions = { libraryPrefix: 'UE_Helpers::', indent: '' };

  let helperStruct = '';
  if (ir.requiredLibraries.size > 0) {
    let structMembers = '';
    if (ir.requiredLibraries.has('simplex2d')) {
      structMembers += `    static float3 mod289(float3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\n` +
        `    static float2 mod289(float2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\n` +
        `    static float3 permute(float3 x) { return mod289(((x * 34.0) + 1.0) * x); }\n\n` +
        `    static float snoise(float2 v) {\n` +
        `        const float4 C = float4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);\n` +
        `        float2 i = floor(v + dot(v, C.yy));\n` +
        `        float2 x0 = v - i + dot(i, C.xx);\n` +
        `        float2 i1;\n` +
        `        i1 = (x0.x > x0.y) ? float2(1.0, 0.0) : float2(0.0, 1.0);\n` +
        `        float4 x12 = x0.xyxy + C.xxzz;\n` +
        `        x12.xy -= i1;\n` +
        `        i = mod289(i);\n` +
        `        float3 p = permute(permute(i.y + float3(0.0, i1.y, 1.0)) + i.x + float3(0.0, i1.x, 1.0));\n` +
        `        float3 m = max(0.5 - float3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);\n` +
        `        m = m * m;\n` +
        `        m = m * m;\n` +
        `        float3 x = 2.0 * frac(p * C.www) - 1.0;\n` +
        `        float3 h = abs(x) - 0.5;\n` +
        `        float3 ox = floor(x + 0.5);\n` +
        `        float3 a0 = x - ox;\n` +
        `        m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);\n` +
        `        float3 g;\n` +
        `        g.x = a0.x * x0.x + h.x * x0.y;\n` +
        `        g.yz = a0.yz * x12.xz + h.yz * x12.yw;\n` +
        `        return 130.0 * dot(m, g);\n` +
        `    }\n\n`;
    }

    if (ir.requiredLibraries.has('voronoi')) {
      structMembers += `    static float2 random2(float2 p) {\n` +
        `        return frac(sin(float2(dot(p, float2(127.1, 311.7)), dot(p, float2(269.5, 183.3)))) * 43758.5453);\n` +
        `    }\n\n` +
        `    static float voronoi(float2 x) {\n` +
        `        float2 n = floor(x);\n` +
        `        float2 f = frac(x);\n` +
        `        float m = 8.0;\n` +
        `        for (int j = -1; j <= 1; j++) {\n` +
        `            for (int i = -1; i <= 1; i++) {\n` +
        `                float2 g = float2(float(i), float(j));\n` +
        `                float2 o = random2(n + g);\n` +
        `                float2 r = g - f + o;\n` +
        `                float d = dot(r, r);\n` +
        `                m = min(m, d);\n` +
        `            }\n` +
        `        }\n` +
        `        return sqrt(m);\n` +
        `    }\n`;
    }

    helperStruct = `// Helper structure for function-local noise libraries\nstruct UE_Helpers {\n${structMembers}};\n\n`;
  }

  let mainBody = '';
  for (const block of ir.blocks) {
    let blockBody = `// Node: ${block.nodeName} (${block.nodeId})\n`;
    for (const stmt of block.statements) {
      blockBody += emitHlslStatement(stmt, options);
    }
    mainBody += blockBody + '\n';
  }

  const baseColorCode = emitHlslExpr(ir.surface.baseColor, options);
  const alphaCode = emitHlslExpr(ir.surface.alpha, options);
  mainBody += '// Surface contract output\n';
  mainBody += `float3 surface_baseColor = ${baseColorCode};\n`;
  mainBody += `float surface_alpha = ${alphaCode};\n\n`;
  mainBody += `Alpha = surface_alpha;\n`;
  mainBody += `return surface_baseColor;\n`;

  return `// --- Unreal Custom Material Expression Code Body ---\n` +
    `// Description: ${cleanName}\n` +
    `// Output Type: CMOT Float3\n` +
    `// Inputs: UV (float2), Time (float)\n` +
    `// Additional Outputs: Alpha (CMOT Float1)\n\n` +
    helperStruct +
    mainBody;
};
