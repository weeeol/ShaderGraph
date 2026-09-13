export type SemanticNodeDef =
  | { type: 'master_output' }
  | { type: 'system_input'; input: 'uv' | 'time' | 'resolution' | 'mouse' }
  | { type: 'constant' }
  | { type: 'binary_op'; operator: '+' | '-' | '*' | '/' }
  | { type: 'interpolate' }
  | { type: 'clamp' }
  | { type: 'step' }
  | { type: 'smoothstep' }
  | { type: 'sine' }
  | { type: 'cosine' }
  | { type: 'power' }
  | { type: 'dot_product' }
  | { type: 'cross_product' }
  | { type: 'normalize' }
  | { type: 'length' }
  | { type: 'fractional' }
  | { type: 'absolute' }
  | { type: 'minimum' }
  | { type: 'maximum' }
  | { type: 'split' }
  | { type: 'combine' }
  | { type: 'procedural_noise'; noiseType: 'simplex2d' | 'voronoi' }
  | { type: 'checkerboard' }
  | { type: 'tile_and_offset' }
  | { type: 'polar_coords' }
  | { type: 'rotate_uv' }
  | { type: 'invert' }
  | { type: 'contrast' };
