import type { Node, Edge } from '@xyflow/react';

export interface SampleGraph {
  id: string;
  name: string;
  description: string;
  tags: string[];
  pipeline: string[];
  nodes: Node[];
  edges: Edge[];
}

export const SAMPLE_GRAPHS: SampleGraph[] = [
  {
    id: 'emerald-marble',
    name: 'Emerald Marble',
    description: 'Simplex noise pipeline with steep contrast remapping and dual-tone vector interpolation.',
    tags: ['Simplex2D', 'Contrast', 'Mix'],
    pipeline: ['UV', 'Simplex 2D', 'Contrast', 'Mix (Lerp)', 'Master Output'],
    nodes: [
      {
        id: 'master-node',
        type: 'masterOutput',
        position: { x: 740, y: 220 },
        data: {},
        deletable: false,
      },
      {
        id: 'node-uv',
        type: 'uv',
        position: { x: 60, y: 180 },
        data: {},
      },
      {
        id: 'node-simplex',
        type: 'simplex2d',
        position: { x: 260, y: 160 },
        data: { scale: 5.0 },
      },
      {
        id: 'node-contrast',
        type: 'contrast',
        position: { x: 470, y: 160 },
        data: { contrast: 2.5 },
      },
      {
        id: 'node-color-a',
        type: 'colorConstant',
        position: { x: 260, y: 320 },
        data: { val: [0.03, 0.22, 0.14, 1.0] },
      },
      {
        id: 'node-color-b',
        type: 'colorConstant',
        position: { x: 260, y: 440 },
        data: { val: [0.82, 0.94, 0.65, 1.0] },
      },
      {
        id: 'node-mix',
        type: 'mix',
        position: { x: 500, y: 320 },
        data: {},
      }
    ],
    edges: [
      {
        id: 'e-uv-simplex',
        source: 'node-uv',
        sourceHandle: 'uv',
        target: 'node-simplex',
        targetHandle: 'uv',
      },
      {
        id: 'e-simplex-contrast',
        source: 'node-simplex',
        sourceHandle: 'out',
        target: 'node-contrast',
        targetHandle: 'val',
      },
      {
        id: 'e-contrast-mix',
        source: 'node-contrast',
        sourceHandle: 'out',
        target: 'node-mix',
        targetHandle: 't',
      },
      {
        id: 'e-cola-mix',
        source: 'node-color-a',
        sourceHandle: 'out',
        target: 'node-mix',
        targetHandle: 'a',
      },
      {
        id: 'e-colb-mix',
        source: 'node-color-b',
        sourceHandle: 'out',
        target: 'node-mix',
        targetHandle: 'b',
      },
      {
        id: 'e-mix-master',
        source: 'node-mix',
        sourceHandle: 'out',
        target: 'master-node',
        targetHandle: 'color',
      }
    ]
  },
  {
    id: 'voronoi-shield',
    name: 'Voronoi Hex Shield',
    description: 'Polar coordinate transformation feeding 2D Voronoi cells with smoothstep falloff thresholding.',
    tags: ['Polar Coords', 'Voronoi', 'Smoothstep'],
    pipeline: ['UV', 'Polar Coords', 'Voronoi', 'Smoothstep', 'Multiply', 'Master Output'],
    nodes: [
      {
        id: 'master-node',
        type: 'masterOutput',
        position: { x: 860, y: 220 },
        data: {},
        deletable: false,
      },
      {
        id: 'node-uv',
        type: 'uv',
        position: { x: 60, y: 180 },
        data: {},
      },
      {
        id: 'node-polar',
        type: 'polarCoords',
        position: { x: 260, y: 160 },
        data: { center: [0.5, 0.5] },
      },
      {
        id: 'node-voronoi',
        type: 'voronoi',
        position: { x: 460, y: 160 },
        data: { scale: 8.0 },
      },
      {
        id: 'node-smoothstep',
        type: 'smoothstep',
        position: { x: 650, y: 160 },
        data: { edge0: [0.05, 0.05, 0.05, 0.05], edge1: [0.35, 0.35, 0.35, 0.35] },
      },
      {
        id: 'node-color',
        type: 'colorConstant',
        position: { x: 460, y: 350 },
        data: { val: [0.1, 0.8, 1.0, 1.0] },
      },
      {
        id: 'node-mult',
        type: 'multiply',
        position: { x: 670, y: 320 },
        data: {},
      }
    ],
    edges: [
      {
        id: 'e-uv-polar',
        source: 'node-uv',
        sourceHandle: 'uv',
        target: 'node-polar',
        targetHandle: 'uv',
      },
      {
        id: 'e-polar-voronoi',
        source: 'node-polar',
        sourceHandle: 'out',
        target: 'node-voronoi',
        targetHandle: 'uv',
      },
      {
        id: 'e-voronoi-smoothstep',
        source: 'node-voronoi',
        sourceHandle: 'out',
        target: 'node-smoothstep',
        targetHandle: 'val',
      },
      {
        id: 'e-smoothstep-mult',
        source: 'node-smoothstep',
        sourceHandle: 'out',
        target: 'node-mult',
        targetHandle: 'a',
      },
      {
        id: 'e-color-mult',
        source: 'node-color',
        sourceHandle: 'out',
        target: 'node-mult',
        targetHandle: 'b',
      },
      {
        id: 'e-mult-master',
        source: 'node-mult',
        sourceHandle: 'out',
        target: 'master-node',
        targetHandle: 'color',
      }
    ]
  },
  {
    id: 'animated-sine-wave',
    name: 'Harmonic Wave Flow',
    description: 'Continuous time uniform modulating spatial coordinates across sinusoidal harmonic bands.',
    tags: ['u_time', 'Sine Math', 'Color Interpolation'],
    pipeline: ['UV + Time', 'Sine Wave', 'Mix (Lerp)', 'Master Output'],
    nodes: [
      {
        id: 'master-node',
        type: 'masterOutput',
        position: { x: 800, y: 220 },
        data: {},
        deletable: false,
      },
      {
        id: 'node-uv',
        type: 'uv',
        position: { x: 60, y: 160 },
        data: {},
      },
      {
        id: 'node-time',
        type: 'time',
        position: { x: 60, y: 320 },
        data: {},
      },
      {
        id: 'node-mult-time',
        type: 'multiply',
        position: { x: 230, y: 320 },
        data: { b: [2.0, 2.0, 2.0, 2.0] },
      },
      {
        id: 'node-add-uv',
        type: 'add',
        position: { x: 310, y: 160 },
        data: {},
      },
      {
        id: 'node-sin',
        type: 'sin',
        position: { x: 480, y: 160 },
        data: {},
      },
      {
        id: 'node-color-pink',
        type: 'colorConstant',
        position: { x: 310, y: 440 },
        data: { val: [0.98, 0.18, 0.58, 1.0] },
      },
      {
        id: 'node-color-blue',
        type: 'colorConstant',
        position: { x: 310, y: 560 },
        data: { val: [0.18, 0.42, 0.98, 1.0] },
      },
      {
        id: 'node-mix',
        type: 'mix',
        position: { x: 600, y: 260 },
        data: {},
      }
    ],
    edges: [
      {
        id: 'e-uv-add',
        source: 'node-uv',
        sourceHandle: 'uv',
        target: 'node-add-uv',
        targetHandle: 'a',
      },
      {
        id: 'e-time-mult',
        source: 'node-time',
        sourceHandle: 't',
        target: 'node-mult-time',
        targetHandle: 'a',
      },
      {
        id: 'e-mult-add',
        source: 'node-mult-time',
        sourceHandle: 'out',
        target: 'node-add-uv',
        targetHandle: 'b',
      },
      {
        id: 'e-add-sin',
        source: 'node-add-uv',
        sourceHandle: 'out',
        target: 'node-sin',
        targetHandle: 'val',
      },
      {
        id: 'e-sin-mix',
        source: 'node-sin',
        sourceHandle: 'out',
        target: 'node-mix',
        targetHandle: 't',
      },
      {
        id: 'e-pink-mix',
        source: 'node-color-pink',
        sourceHandle: 'out',
        target: 'node-mix',
        targetHandle: 'a',
      },
      {
        id: 'e-blue-mix',
        source: 'node-color-blue',
        sourceHandle: 'out',
        target: 'node-mix',
        targetHandle: 'b',
      },
      {
        id: 'e-mix-master',
        source: 'node-mix',
        sourceHandle: 'out',
        target: 'master-node',
        targetHandle: 'color',
      }
    ]
  },
  {
    id: 'rotating-checker-array',
    name: 'Rotating Checker Array',
    description: 'Dynamic time-driven rotation of coordinate space driving a procedural alternating checkerboard grid.',
    tags: ['u_time', 'Rotate UV', 'Checkerboard', 'Mix'],
    pipeline: ['UV + Time', 'Rotate UV', 'Checkerboard', 'Mix (Lerp)', 'Master Output'],
    nodes: [
      {
        id: 'master-node',
        type: 'masterOutput',
        position: { x: 960, y: 240 },
        data: {},
        deletable: false,
      },
      {
        id: 'node-uv',
        type: 'uv',
        position: { x: 60, y: 140 },
        data: {},
      },
      {
        id: 'node-time',
        type: 'time',
        position: { x: 60, y: 320 },
        data: {},
      },
      {
        id: 'node-mult-rate',
        type: 'multiply',
        position: { x: 240, y: 320 },
        data: { b: [0.6, 0.6, 0.6, 0.6] },
      },
      {
        id: 'node-rotate-uv',
        type: 'rotateUv',
        position: { x: 420, y: 160 },
        data: { center: [0.5, 0.5] },
      },
      {
        id: 'node-checker',
        type: 'checkerboard',
        position: { x: 600, y: 160 },
        data: { scale: 8.0 },
      },
      {
        id: 'node-color-a',
        type: 'colorConstant',
        position: { x: 420, y: 340 },
        data: { val: [0.12, 0.14, 0.18, 1.0] },
      },
      {
        id: 'node-color-b',
        type: 'colorConstant',
        position: { x: 420, y: 460 },
        data: { val: [0.92, 0.84, 0.68, 1.0] },
      },
      {
        id: 'node-mix',
        type: 'mix',
        position: { x: 780, y: 240 },
        data: {},
      }
    ],
    edges: [
      {
        id: 'e-time-mult',
        source: 'node-time',
        sourceHandle: 't',
        target: 'node-mult-rate',
        targetHandle: 'a',
      },
      {
        id: 'e-uv-rot',
        source: 'node-uv',
        sourceHandle: 'uv',
        target: 'node-rotate-uv',
        targetHandle: 'uv',
      },
      {
        id: 'e-mult-rot',
        source: 'node-mult-rate',
        sourceHandle: 'out',
        target: 'node-rotate-uv',
        targetHandle: 'angle',
      },
      {
        id: 'e-rot-checker',
        source: 'node-rotate-uv',
        sourceHandle: 'out',
        target: 'node-checker',
        targetHandle: 'uv',
      },
      {
        id: 'e-checker-mix',
        source: 'node-checker',
        sourceHandle: 'out',
        target: 'node-mix',
        targetHandle: 't',
      },
      {
        id: 'e-cola-mix',
        source: 'node-color-a',
        sourceHandle: 'out',
        target: 'node-mix',
        targetHandle: 'a',
      },
      {
        id: 'e-colb-mix',
        source: 'node-color-b',
        sourceHandle: 'out',
        target: 'node-mix',
        targetHandle: 'b',
      },
      {
        id: 'e-mix-master',
        source: 'node-mix',
        sourceHandle: 'out',
        target: 'master-node',
        targetHandle: 'color',
      }
    ]
  },
  {
    id: 'drifting-voronoi-field',
    name: 'Drifting Voronoi Field',
    description: 'Dynamic time-translated UV coordinate space modulating procedural cellular Voronoi distance fields.',
    tags: ['u_time', 'Voronoi', 'UV Translation', 'Smoothstep'],
    pipeline: ['UV + Time', 'Add (Offset)', 'Voronoi', 'Smoothstep', 'Mix (Lerp)', 'Master Output'],
    nodes: [
      {
        id: 'master-node',
        type: 'masterOutput',
        position: { x: 1040, y: 220 },
        data: {},
        deletable: false,
      },
      {
        id: 'node-uv',
        type: 'uv',
        position: { x: 60, y: 140 },
        data: {},
      },
      {
        id: 'node-time',
        type: 'time',
        position: { x: 60, y: 300 },
        data: {},
      },
      {
        id: 'node-mult-time',
        type: 'multiply',
        position: { x: 230, y: 300 },
        data: { b: [0.2, 0.15, 0.0, 0.0] },
      },
      {
        id: 'node-add-uv',
        type: 'add',
        position: { x: 390, y: 160 },
        data: {},
      },
      {
        id: 'node-voronoi',
        type: 'voronoi',
        position: { x: 550, y: 160 },
        data: { scale: 6.0 },
      },
      {
        id: 'node-smoothstep',
        type: 'smoothstep',
        position: { x: 720, y: 160 },
        data: { edge0: [0.05, 0.05, 0.05, 0.05], edge1: [0.45, 0.45, 0.45, 0.45] },
      },
      {
        id: 'node-color-dark',
        type: 'colorConstant',
        position: { x: 550, y: 340 },
        data: { val: [0.02, 0.06, 0.1, 1.0] },
      },
      {
        id: 'node-color-cyan',
        type: 'colorConstant',
        position: { x: 550, y: 460 },
        data: { val: [0.05, 0.85, 0.95, 1.0] },
      },
      {
        id: 'node-mix',
        type: 'mix',
        position: { x: 890, y: 220 },
        data: {},
      }
    ],
    edges: [
      {
        id: 'e-time-mult',
        source: 'node-time',
        sourceHandle: 't',
        target: 'node-mult-time',
        targetHandle: 'a',
      },
      {
        id: 'e-uv-add',
        source: 'node-uv',
        sourceHandle: 'uv',
        target: 'node-add-uv',
        targetHandle: 'a',
      },
      {
        id: 'e-mult-add',
        source: 'node-mult-time',
        sourceHandle: 'out',
        target: 'node-add-uv',
        targetHandle: 'b',
      },
      {
        id: 'e-add-voronoi',
        source: 'node-add-uv',
        sourceHandle: 'out',
        target: 'node-voronoi',
        targetHandle: 'uv',
      },
      {
        id: 'e-voronoi-smoothstep',
        source: 'node-voronoi',
        sourceHandle: 'out',
        target: 'node-smoothstep',
        targetHandle: 'val',
      },
      {
        id: 'e-smoothstep-mix',
        source: 'node-smoothstep',
        sourceHandle: 'out',
        target: 'node-mix',
        targetHandle: 't',
      },
      {
        id: 'e-coldark-mix',
        source: 'node-color-dark',
        sourceHandle: 'out',
        target: 'node-mix',
        targetHandle: 'a',
      },
      {
        id: 'e-colcyan-mix',
        source: 'node-color-cyan',
        sourceHandle: 'out',
        target: 'node-mix',
        targetHandle: 'b',
      },
      {
        id: 'e-mix-master',
        source: 'node-mix',
        sourceHandle: 'out',
        target: 'master-node',
        targetHandle: 'color',
      }
    ]
  },
  {
    id: 'pulse-gradient',
    name: 'Pulse Gradient',
    description: 'Harmonic sinusoidal time oscillation interpolating between two chromatic tone constants.',
    tags: ['u_time', 'Sine Math', 'Color Interpolation', 'Mix'],
    pipeline: ['Time', 'Multiply (Rate)', 'Sine Oscillation', 'Mix (Lerp)', 'Master Output'],
    nodes: [
      {
        id: 'master-node',
        type: 'masterOutput',
        position: { x: 820, y: 220 },
        data: {},
        deletable: false,
      },
      {
        id: 'node-time',
        type: 'time',
        position: { x: 60, y: 160 },
        data: {},
      },
      {
        id: 'node-mult-rate',
        type: 'multiply',
        position: { x: 230, y: 160 },
        data: { b: [1.2, 1.2, 1.2, 1.2] },
      },
      {
        id: 'node-sin',
        type: 'sin',
        position: { x: 420, y: 160 },
        data: {},
      },
      {
        id: 'node-color-a',
        type: 'colorConstant',
        position: { x: 420, y: 300 },
        data: { val: [0.12, 0.08, 0.28, 1.0] },
      },
      {
        id: 'node-color-b',
        type: 'colorConstant',
        position: { x: 420, y: 420 },
        data: { val: [0.95, 0.48, 0.22, 1.0] },
      },
      {
        id: 'node-mix',
        type: 'mix',
        position: { x: 620, y: 220 },
        data: {},
      }
    ],
    edges: [
      {
        id: 'e-time-mult',
        source: 'node-time',
        sourceHandle: 't',
        target: 'node-mult-rate',
        targetHandle: 'a',
      },
      {
        id: 'e-mult-sin',
        source: 'node-mult-rate',
        sourceHandle: 'out',
        target: 'node-sin',
        targetHandle: 'val',
      },
      {
        id: 'e-sin-mix',
        source: 'node-sin',
        sourceHandle: 'out',
        target: 'node-mix',
        targetHandle: 't',
      },
      {
        id: 'e-cola-mix',
        source: 'node-color-a',
        sourceHandle: 'out',
        target: 'node-mix',
        targetHandle: 'a',
      },
      {
        id: 'e-colb-mix',
        source: 'node-color-b',
        sourceHandle: 'out',
        target: 'node-mix',
        targetHandle: 'b',
      },
      {
        id: 'e-mix-master',
        source: 'node-mix',
        sourceHandle: 'out',
        target: 'master-node',
        targetHandle: 'color',
      }
    ]
  }
];
