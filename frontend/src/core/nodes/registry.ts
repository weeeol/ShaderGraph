import type { NodeRegistry } from '../engine/compiler';

export const NODE_REGISTRY: NodeRegistry = {
  // --- MASTER OUTPUT ---
  masterOutput: {
    id: 'masterOutput',
    type: 'masterOutput',
    name: 'Master Output',
    inputs: [
      { id: 'color', name: 'Color', type: 'vec4', defaultValue: [0, 0, 0, 1] }
    ],
    outputs: [],
    glslTemplate: "fragColor = {{in_color}};"
  },

  // --- INPUTS ---
  uv: {
    id: 'uv',
    type: 'uv',
    name: 'UV Coordinates',
    inputs: [],
    outputs: [
      { id: 'uv', name: 'UV', type: 'vec2' }
    ],
    glslTemplate: "{{out_uv}} = v_uv;"
  },
  time: {
    id: 'time',
    type: 'time',
    name: 'Time',
    inputs: [],
    outputs: [
      { id: 't', name: 'Time', type: 'float' }
    ],
    glslTemplate: "{{out_t}} = u_time;"
  },
  resolution: {
    id: 'resolution',
    type: 'resolution',
    name: 'Resolution',
    inputs: [],
    outputs: [
      { id: 'res', name: 'Resolution', type: 'vec2' }
    ],
    glslTemplate: "{{out_res}} = u_resolution;"
  },
  mouse: {
    id: 'mouse',
    type: 'mouse',
    name: 'Mouse',
    inputs: [],
    outputs: [
      { id: 'm', name: 'Mouse', type: 'vec2' }
    ],
    glslTemplate: "{{out_m}} = u_mouse;"
  },
  floatConstant: {
    id: 'floatConstant',
    type: 'floatConstant',
    name: 'Float',
    inputs: [
      { id: 'val', name: 'Value', type: 'float', defaultValue: 1.0 }
    ],
    outputs: [
      { id: 'out', name: 'Out', type: 'float' }
    ],
    glslTemplate: "{{out_out}} = {{in_val}};"
  },
  colorConstant: {
    id: 'colorConstant',
    type: 'colorConstant',
    name: 'Color',
    inputs: [
      { id: 'val', name: 'Value', type: 'vec4', defaultValue: [1.0, 1.0, 1.0, 1.0] }
    ],
    outputs: [
      { id: 'out', name: 'Out', type: 'vec4' }
    ],
    glslTemplate: "{{out_out}} = {{in_val}};"
  },

  // --- MATH ---
  add: {
    id: 'add',
    type: 'add',
    name: 'Add',
    inputs: [
      { id: 'a', name: 'A', type: 'float', defaultValue: 0.0 },
      { id: 'b', name: 'B', type: 'float', defaultValue: 0.0 }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'float' }],
    glslTemplate: "{{out_out}} = {{in_a}} + {{in_b}};"
  },
  subtract: {
    id: 'subtract',
    type: 'subtract',
    name: 'Subtract',
    inputs: [
      { id: 'a', name: 'A', type: 'float', defaultValue: 0.0 },
      { id: 'b', name: 'B', type: 'float', defaultValue: 0.0 }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'float' }],
    glslTemplate: "{{out_out}} = {{in_a}} - {{in_b}};"
  },
  multiply: {
    id: 'multiply',
    type: 'multiply',
    name: 'Multiply',
    inputs: [
      { id: 'a', name: 'A', type: 'float', defaultValue: 1.0 },
      { id: 'b', name: 'B', type: 'float', defaultValue: 1.0 }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'float' }],
    glslTemplate: "{{out_out}} = {{in_a}} * {{in_b}};"
  },
  divide: {
    id: 'divide',
    type: 'divide',
    name: 'Divide',
    inputs: [
      { id: 'a', name: 'A', type: 'float', defaultValue: 1.0 },
      { id: 'b', name: 'B', type: 'float', defaultValue: 1.0 }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'float' }],
    glslTemplate: "{{out_out}} = {{in_a}} / ({{in_b}} + 0.000001);"
  },
  mix: {
    id: 'mix',
    type: 'mix',
    name: 'Mix (Lerp)',
    inputs: [
      { id: 'a', name: 'A', type: 'float', defaultValue: 0.0 },
      { id: 'b', name: 'B', type: 'float', defaultValue: 1.0 },
      { id: 't', name: 'T', type: 'float', defaultValue: 0.5 }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'float' }],
    glslTemplate: "{{out_out}} = mix({{in_a}}, {{in_b}}, {{in_t}});"
  },
  clamp: {
    id: 'clamp',
    type: 'clamp',
    name: 'Clamp',
    inputs: [
      { id: 'val', name: 'Val', type: 'float', defaultValue: 0.0 },
      { id: 'min', name: 'Min', type: 'float', defaultValue: 0.0 },
      { id: 'max', name: 'Max', type: 'float', defaultValue: 1.0 }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'float' }],
    glslTemplate: "{{out_out}} = clamp({{in_val}}, {{in_min}}, {{in_max}});"
  },
  step: {
    id: 'step',
    type: 'step',
    name: 'Step',
    inputs: [
      { id: 'edge', name: 'Edge', type: 'float', defaultValue: 0.5 },
      { id: 'val', name: 'Val', type: 'float', defaultValue: 0.0 }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'float' }],
    glslTemplate: "{{out_out}} = step({{in_edge}}, {{in_val}});"
  },
  smoothstep: {
    id: 'smoothstep',
    type: 'smoothstep',
    name: 'Smoothstep',
    inputs: [
      { id: 'edge0', name: 'Edge0', type: 'float', defaultValue: 0.0 },
      { id: 'edge1', name: 'Edge1', type: 'float', defaultValue: 1.0 },
      { id: 'val', name: 'Val', type: 'float', defaultValue: 0.5 }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'float' }],
    glslTemplate: "{{out_out}} = smoothstep({{in_edge0}}, {{in_edge1}}, {{in_val}});"
  },
  sin: {
    id: 'sin',
    type: 'sin',
    name: 'Sine',
    inputs: [{ id: 'val', name: 'Val', type: 'float', defaultValue: 0.0 }],
    outputs: [{ id: 'out', name: 'Out', type: 'float' }],
    glslTemplate: "{{out_out}} = sin({{in_val}});"
  },
  cos: {
    id: 'cos',
    type: 'cos',
    name: 'Cosine',
    inputs: [{ id: 'val', name: 'Val', type: 'float', defaultValue: 0.0 }],
    outputs: [{ id: 'out', name: 'Out', type: 'float' }],
    glslTemplate: "{{out_out}} = cos({{in_val}});"
  },
  power: {
    id: 'power',
    type: 'power',
    name: 'Power',
    inputs: [
      { id: 'base', name: 'Base', type: 'float', defaultValue: 1.0 },
      { id: 'exp', name: 'Exp', type: 'float', defaultValue: 2.0 }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'float' }],
    glslTemplate: "{{out_out}} = pow(max({{in_base}}, 0.0), {{in_exp}});"
  },

  // --- PROCEDURAL / NOISE ---
  simplex2d: {
    id: 'simplex2d',
    type: 'simplex2d',
    name: 'Simplex Noise 2D',
    inputs: [
      { id: 'uv', name: 'UV', type: 'vec2', defaultValue: [0, 0] },
      { id: 'scale', name: 'Scale', type: 'float', defaultValue: 10.0 }
    ],
    outputs: [{ id: 'out', name: 'Noise', type: 'float' }],
    glslTemplate: "{{out_out}} = snoise({{in_uv}} * {{in_scale}});"
  },
  voronoi: {
    id: 'voronoi',
    type: 'voronoi',
    name: 'Voronoi Noise',
    inputs: [
      { id: 'uv', name: 'UV', type: 'vec2', defaultValue: [0, 0] },
      { id: 'scale', name: 'Scale', type: 'float', defaultValue: 5.0 }
    ],
    outputs: [{ id: 'out', name: 'Noise', type: 'float' }],
    glslTemplate: "{{out_out}} = voronoi({{in_uv}} * {{in_scale}});"
  },
  checkerboard: {
    id: 'checkerboard',
    type: 'checkerboard',
    name: 'Checkerboard',
    inputs: [
      { id: 'uv', name: 'UV', type: 'vec2', defaultValue: [0, 0] },
      { id: 'scale', name: 'Scale', type: 'float', defaultValue: 10.0 }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'float' }],
    glslTemplate: `
      vec2 scaled_uv = floor({{in_uv}} * {{in_scale}});
      {{out_out}} = mod(scaled_uv.x + scaled_uv.y, 2.0);
    `
  },

  // --- UV & FILTERS ---
  tileAndOffset: {
    id: 'tileAndOffset',
    type: 'tileAndOffset',
    name: 'Tile & Offset',
    inputs: [
      { id: 'uv', name: 'UV', type: 'vec2', defaultValue: [0, 0] },
      { id: 'tiling', name: 'Tiling', type: 'vec2', defaultValue: [1, 1] },
      { id: 'offset', name: 'Offset', type: 'vec2', defaultValue: [0, 0] }
    ],
    outputs: [{ id: 'out', name: 'UV', type: 'vec2' }],
    glslTemplate: "{{out_out}} = ({{in_uv}} * {{in_tiling}}) + {{in_offset}};"
  },
  polarCoords: {
    id: 'polarCoords',
    type: 'polarCoords',
    name: 'Polar Coordinates',
    inputs: [
      { id: 'uv', name: 'UV', type: 'vec2', defaultValue: [0, 0] },
      { id: 'center', name: 'Center', type: 'vec2', defaultValue: [0.5, 0.5] }
    ],
    outputs: [{ id: 'out', name: 'Polar UV', type: 'vec2' }],
    glslTemplate: `
      vec2 delta = {{in_uv}} - {{in_center}};
      float radius = length(delta) * 2.0;
      float angle = atan(delta.y, delta.x) / 6.28318530718 + 0.5;
      {{out_out}} = vec2(radius, angle);
    `
  },
  rotateUv: {
    id: 'rotateUv',
    type: 'rotateUv',
    name: 'Rotate UV',
    inputs: [
      { id: 'uv', name: 'UV', type: 'vec2', defaultValue: [0, 0] },
      { id: 'angle', name: 'Angle', type: 'float', defaultValue: 0.0 },
      { id: 'center', name: 'Center', type: 'vec2', defaultValue: [0.5, 0.5] }
    ],
    outputs: [{ id: 'out', name: 'UV', type: 'vec2' }],
    glslTemplate: `
      float s = sin({{in_angle}});
      float c = cos({{in_angle}});
      vec2 p = {{in_uv}} - {{in_center}};
      {{out_out}} = vec2(p.x * c - p.y * s, p.x * s + p.y * c) + {{in_center}};
    `
  },
  invert: {
    id: 'invert',
    type: 'invert',
    name: 'Invert',
    inputs: [
      { id: 'val', name: 'Val', type: 'float', defaultValue: 0.0 }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'float' }],
    glslTemplate: "{{out_out}} = 1.0 - {{in_val}};"
  },
  contrast: {
    id: 'contrast',
    type: 'contrast',
    name: 'Contrast',
    inputs: [
      { id: 'val', name: 'Val', type: 'float', defaultValue: 0.0 },
      { id: 'contrast', name: 'Contrast', type: 'float', defaultValue: 1.0 }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'float' }],
    glslTemplate: "{{out_out}} = ({{in_val}} - 0.5) * {{in_contrast}} + 0.5;"
  }
};
