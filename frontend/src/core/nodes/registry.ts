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
    semantic: { type: 'master_output' }
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
    semantic: { type: 'system_input', input: 'uv' }
  },
  time: {
    id: 'time',
    type: 'time',
    name: 'Time',
    inputs: [],
    outputs: [
      { id: 't', name: 'Time', type: 'float' }
    ],
    semantic: { type: 'system_input', input: 'time' }
  },
  resolution: {
    id: 'resolution',
    type: 'resolution',
    name: 'Resolution',
    inputs: [],
    outputs: [
      { id: 'res', name: 'Resolution', type: 'vec2' }
    ],
    semantic: { type: 'system_input', input: 'resolution' }
  },
  mouse: {
    id: 'mouse',
    type: 'mouse',
    name: 'Mouse',
    inputs: [],
    outputs: [
      { id: 'm', name: 'Mouse', type: 'vec2' }
    ],
    semantic: { type: 'system_input', input: 'mouse' }
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
    semantic: { type: 'constant' }
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
    semantic: { type: 'constant' }
  },

  // --- MATH ---
  add: {
    id: 'add',
    type: 'add',
    name: 'Add',
    inputs: [
      { id: 'a', name: 'A', type: 'vec4', defaultValue: [0, 0, 0, 0] },
      { id: 'b', name: 'B', type: 'vec4', defaultValue: [0, 0, 0, 0] }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'vec4' }],
    semantic: { type: 'binary_op', operator: '+' }
  },
  subtract: {
    id: 'subtract',
    type: 'subtract',
    name: 'Subtract',
    inputs: [
      { id: 'a', name: 'A', type: 'vec4', defaultValue: [0, 0, 0, 0] },
      { id: 'b', name: 'B', type: 'vec4', defaultValue: [0, 0, 0, 0] }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'vec4' }],
    semantic: { type: 'binary_op', operator: '-' }
  },
  multiply: {
    id: 'multiply',
    type: 'multiply',
    name: 'Multiply',
    inputs: [
      { id: 'a', name: 'A', type: 'vec4', defaultValue: [1, 1, 1, 1] },
      { id: 'b', name: 'B', type: 'vec4', defaultValue: [1, 1, 1, 1] }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'vec4' }],
    semantic: { type: 'binary_op', operator: '*' }
  },
  divide: {
    id: 'divide',
    type: 'divide',
    name: 'Divide',
    inputs: [
      { id: 'a', name: 'A', type: 'vec4', defaultValue: [1, 1, 1, 1] },
      { id: 'b', name: 'B', type: 'vec4', defaultValue: [1, 1, 1, 1] }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'vec4' }],
    semantic: { type: 'binary_op', operator: '/' }
  },
  mix: {
    id: 'mix',
    type: 'mix',
    name: 'Mix (Lerp)',
    inputs: [
      { id: 'a', name: 'A', type: 'vec4', defaultValue: [0, 0, 0, 0] },
      { id: 'b', name: 'B', type: 'vec4', defaultValue: [1, 1, 1, 1] },
      { id: 't', name: 'T', type: 'vec4', defaultValue: [0.5, 0.5, 0.5, 0.5] }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'vec4' }],
    semantic: { type: 'interpolate' }
  },
  clamp: {
    id: 'clamp',
    type: 'clamp',
    name: 'Clamp',
    inputs: [
      { id: 'val', name: 'Val', type: 'vec4', defaultValue: [0, 0, 0, 0] },
      { id: 'min', name: 'Min', type: 'vec4', defaultValue: [0, 0, 0, 0] },
      { id: 'max', name: 'Max', type: 'vec4', defaultValue: [1, 1, 1, 1] }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'vec4' }],
    semantic: { type: 'clamp' }
  },
  step: {
    id: 'step',
    type: 'step',
    name: 'Step',
    inputs: [
      { id: 'edge', name: 'Edge', type: 'vec4', defaultValue: [0.5, 0.5, 0.5, 0.5] },
      { id: 'val', name: 'Val', type: 'vec4', defaultValue: [0, 0, 0, 0] }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'vec4' }],
    semantic: { type: 'step' }
  },
  smoothstep: {
    id: 'smoothstep',
    type: 'smoothstep',
    name: 'Smoothstep',
    inputs: [
      { id: 'edge0', name: 'Edge0', type: 'vec4', defaultValue: [0, 0, 0, 0] },
      { id: 'edge1', name: 'Edge1', type: 'vec4', defaultValue: [1, 1, 1, 1] },
      { id: 'val', name: 'Val', type: 'vec4', defaultValue: [0.5, 0.5, 0.5, 0.5] }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'vec4' }],
    semantic: { type: 'smoothstep' }
  },
  sin: {
    id: 'sin',
    type: 'sin',
    name: 'Sine',
    inputs: [{ id: 'val', name: 'Val', type: 'vec4', defaultValue: [0, 0, 0, 0] }],
    outputs: [{ id: 'out', name: 'Out', type: 'vec4' }],
    semantic: { type: 'sine' }
  },
  cos: {
    id: 'cos',
    type: 'cos',
    name: 'Cosine',
    inputs: [{ id: 'val', name: 'Val', type: 'vec4', defaultValue: [0, 0, 0, 0] }],
    outputs: [{ id: 'out', name: 'Out', type: 'vec4' }],
    semantic: { type: 'cosine' }
  },
  power: {
    id: 'power',
    type: 'power',
    name: 'Power',
    inputs: [
      { id: 'base', name: 'Base', type: 'vec4', defaultValue: [1, 1, 1, 1] },
      { id: 'exp', name: 'Exp', type: 'vec4', defaultValue: [2, 2, 2, 2] }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'vec4' }],
    semantic: { type: 'power' }
  },
  dot: {
    id: 'dot',
    type: 'dot',
    name: 'Dot Product',
    inputs: [
      { id: 'a', name: 'A', type: 'vec4', defaultValue: [0, 0, 0, 0] },
      { id: 'b', name: 'B', type: 'vec4', defaultValue: [0, 0, 0, 0] }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'float' }],
    semantic: { type: 'dot_product' }
  },
  cross: {
    id: 'cross',
    type: 'cross',
    name: 'Cross Product',
    inputs: [
      { id: 'a', name: 'A', type: 'vec3', defaultValue: [0, 0, 0] },
      { id: 'b', name: 'B', type: 'vec3', defaultValue: [0, 0, 0] }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'vec3' }],
    semantic: { type: 'cross_product' }
  },
  normalize: {
    id: 'normalize',
    type: 'normalize',
    name: 'Normalize',
    inputs: [{ id: 'val', name: 'Val', type: 'vec4', defaultValue: [0, 0, 0, 0] }],
    outputs: [{ id: 'out', name: 'Out', type: 'vec4' }],
    semantic: { type: 'normalize' }
  },
  length: {
    id: 'length',
    type: 'length',
    name: 'Length',
    inputs: [{ id: 'val', name: 'Val', type: 'vec4', defaultValue: [0, 0, 0, 0] }],
    outputs: [{ id: 'out', name: 'Out', type: 'float' }],
    semantic: { type: 'length' }
  },
  fract: {
    id: 'fract',
    type: 'fract',
    name: 'Fract',
    inputs: [{ id: 'val', name: 'Val', type: 'vec4', defaultValue: [0, 0, 0, 0] }],
    outputs: [{ id: 'out', name: 'Out', type: 'vec4' }],
    semantic: { type: 'fractional' }
  },
  abs: {
    id: 'abs',
    type: 'abs',
    name: 'Absolute',
    inputs: [{ id: 'val', name: 'Val', type: 'vec4', defaultValue: [0, 0, 0, 0] }],
    outputs: [{ id: 'out', name: 'Out', type: 'vec4' }],
    semantic: { type: 'absolute' }
  },
  min: {
    id: 'min',
    type: 'min',
    name: 'Minimum',
    inputs: [
      { id: 'a', name: 'A', type: 'vec4', defaultValue: [0, 0, 0, 0] },
      { id: 'b', name: 'B', type: 'vec4', defaultValue: [0, 0, 0, 0] }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'vec4' }],
    semantic: { type: 'minimum' }
  },
  max: {
    id: 'max',
    type: 'max',
    name: 'Maximum',
    inputs: [
      { id: 'a', name: 'A', type: 'vec4', defaultValue: [0, 0, 0, 0] },
      { id: 'b', name: 'B', type: 'vec4', defaultValue: [0, 0, 0, 0] }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'vec4' }],
    semantic: { type: 'maximum' }
  },
  split: {
    id: 'split',
    type: 'split',
    name: 'Split',
    inputs: [{ id: 'val', name: 'In', type: 'vec4', defaultValue: [0, 0, 0, 0] }],
    outputs: [
      { id: 'r', name: 'R', type: 'float' },
      { id: 'g', name: 'G', type: 'float' },
      { id: 'b', name: 'B', type: 'float' },
      { id: 'a', name: 'A', type: 'float' }
    ],
    semantic: { type: 'split' }
  },
  combine: {
    id: 'combine',
    type: 'combine',
    name: 'Combine',
    inputs: [
      { id: 'r', name: 'R', type: 'float', defaultValue: 0.0 },
      { id: 'g', name: 'G', type: 'float', defaultValue: 0.0 },
      { id: 'b', name: 'B', type: 'float', defaultValue: 0.0 },
      { id: 'a', name: 'A', type: 'float', defaultValue: 1.0 }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'vec4' }],
    semantic: { type: 'combine' }
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
    semantic: { type: 'procedural_noise', noiseType: 'simplex2d' }
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
    semantic: { type: 'procedural_noise', noiseType: 'voronoi' }
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
    semantic: { type: 'checkerboard' }
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
    semantic: { type: 'tile_and_offset' }
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
    semantic: { type: 'polar_coords' }
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
    semantic: { type: 'rotate_uv' }
  },
  invert: {
    id: 'invert',
    type: 'invert',
    name: 'Invert',
    inputs: [
      { id: 'val', name: 'Val', type: 'float', defaultValue: 0.0 }
    ],
    outputs: [{ id: 'out', name: 'Out', type: 'float' }],
    semantic: { type: 'invert' }
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
    semantic: { type: 'contrast' }
  }
};
