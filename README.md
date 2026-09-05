# ShaderGraph

A fast, web-based visual node editor for authoring WebGL2 shaders in real time.

*Created by **Veol Steve***

Construct complex GLSL fragment shaders through a node-based DAG (Directed Acyclic Graph) workflow with automatic type conversion, instant 3D viewport previews, dynamic GLSL code generation, texture baking, and workspace management.

---

## Key Features

### Visual Shader Editing
- **Node-Based DAG Canvas**: Built with `@xyflow/react` for smooth panning, zooming, node grouping, and reactive edge routing.
- **Smart Type Casting Engine**: Seamlessly connect scalar (`float`) and vector (`vec2`, `vec3`, `vec4`) inputs. The compiler handles component swizzling, vector expansion, and type casting automatically.
- **Cycle & Error Detection**: Instant topological validation prevents circular dependencies and flags compilation or syntax errors without crashing the viewport.
- **Precision Inline Controls**: Sliders, number inputs, and hex color pickers are isolated with strict event propagation rules so tweaking parameters never accidentally drags nodes.

### Real-Time 3D Viewport
- **Extended 3D Mesh Library**: Preview shaders live across 5 geometry types: **Cube**, **Sphere**, **Plane**, **Torus Knot** (organic curvature), and **Cylinder**.
- **Wireframe Overlay**: Toggle a synchronized wireframe overlay to inspect surface topology, edge flow, and UV alignment without obscuring your shader.
- **Custom Viewport Backgrounds**: Cycle between **Studio** (solid dark/light), **Gradient** (vignette depth), and **Checkerboard** (transparency grid for alpha verification).
- **Collapsible Performance HUD**: Floating stats monitor reporting real-time **FPS**, **Draw Calls**, **Triangles**, and elapsed **`u_time`**.
- **Orbit Controls & Interaction**: Full rotational orbit, pan, and zoom powered by Three.js & `@react-three/fiber`.

### Workspace Manager & Curated Presets
- **Interactive Workspace Modal**: Switch graphs seamlessly, start fresh blank canvases, or load saved graphs anytime.
- **Pre-Built Curated Samples**:
  - **Emerald Marble**: Simplex procedural noise routed through contrast enhancement and multi-stop color blending.
  - **Voronoi Sci-Fi Shield**: Polar coordinate distortion driving Worley/Voronoi cells with smoothstep edge glows.
  - **Chromatic Sine Flow**: Time-multiplied harmonic sine waves creating vibrant animated interference patterns.
- **Local Persistence & Portability**: Save graphs directly in browser `localStorage`, export graphs as `.json` files, or import project files from your local disk.

### Eye-Friendly Dual Theme
- **Studio Dark Theme**: Deep zinc palette with sleek borders and high contrast.
- **Eye-Friendly Warm Light Theme**: Specially tuned warm neutral tones (`#e4e4e8`, `#f3f3f6`) engineered to prevent glare and eye fatigue during long authoring sessions.
- **One-Click Toggle**: Switch instantly between light and dark themes from the header bar.

### GLSL Code Viewer & Exporting
- **Real-Time `#version 300 es` Generation**: Inspect the exact fragment shader code produced by the transpiler.
- **1-Click Copy**: Copy generated GLSL shaders to clipboard with instantaneous visual feedback.
- **Texture Baking**: Bake procedural shaders into high-resolution PNG image textures via off-screen WebGL rendering.
- **Keyboard Shortcuts & Quick Guide**: Integrated reference overlay detailing node types, connection tips, and editor shortcuts.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) + [Vite](https://vite.dev/) |
| **Node Graph** | [@xyflow/react (React Flow)](https://reactflow.dev/) |
| **3D Rendering** | [Three.js](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/) + [@react-three/drei](https://github.com/pmndrs/drei) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Testing** | [Vitest](https://vitest.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `pnpm`

### Installation

1. Clone the repository and enter the frontend directory:
   ```bash
   git clone https://github.com/your-username/ShaderGraph.git
   cd ShaderGraph/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:5173`.

---

## Available Scripts

Within the `frontend` folder, you can run:

- `npm run dev`: Starts the Vite dev server with hot module replacement (HMR).
- `npm run build`: Runs TypeScript compilation (`tsc -b`) and bundles production assets with Vite.
- `npx vitest run`: Executes the automated test suite (compiler DAG traversal, cycle checks, and sample validations).
- `npm run preview`: Locally previews the production build.

---

## Node Library Overview

| Category | Node Types | Description |
|---|---|---|
| **Inputs** | `UV`, `Time`, `Color`, `Float` | Coordinate data, uniforms, constants, and color pickers. |
| **Math** | `Add`, `Subtract`, `Multiply`, `Divide`, `Power`, `Min`, `Max`, `Abs` | Algebraic operations with automatic scalar-to-vector promotion. |
| **Trigonometry** | `Sine`, `Cosine` | Periodic oscillation and wave functions. |
| **Interpolation** | `Mix`, `Step`, `Smoothstep`, `Clamp` | Blending, thresholding, and range clamping. |
| **Procedural** | `SimplexNoise`, `Voronoi` | Analytic 2D simplex noise and Worley/Voronoi cellular distance patterns. |
| **Vector** | `SplitVec`, `CombineVec` | Vector component splitting (`x, y, z, w`) and multi-channel recombination. |
| **Output** | `Master` | Final fragment color sink (`FragColor`) driving the 3D viewport and texture baker. |

---

## Project Structure

```
ShaderGraph/
├── README.md
├── LICENSE
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── graph/          # Custom nodes, controls, and canvas wrappers
    │   │   ├── layout/         # Header, Sidebar, WorkspaceModal, IntroModal
    │   │   └── preview/        # LiveViewport (Three.js canvas), GLSLViewer
    │   ├── core/
    │   │   ├── engine/         # DAG compiler, topological sort, GLSL templates
    │   │   ├── nodes/          # Node registry, port schemas, default values
    │   │   └── samples/        # Interactive sample shader definitions
    │   ├── store/              # Zustand graph store, themes, and persistence
    │   ├── App.tsx             # Main editor layout & keyboard shortcut bindings
    │   └── main.tsx            # React application entry point
    ├── package.json
    └── vite.config.ts
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Right-Click` / `Tab` | Open Quick Node Search at cursor |
| `Ctrl + Z` | Undo last action |
| `Ctrl + Y` / `Ctrl + Shift + Z` | Redo action |
| `Ctrl + D` | Duplicate selected nodes with values |
| `Delete` / `Backspace` | Remove selected nodes or connections |
| `Space + Drag` | Pan canvas |
| `Scroll Wheel` | Zoom in / out |
| `Escape` | Close active modals (Quick Search, Workspace Manager, Reference) |

---

## Author

Designed and developed by **Veol Steve**.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.