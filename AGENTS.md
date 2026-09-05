# AGENTS.md — Developer & AI Agent Guidelines

This document establishes development rules, design constraints, tech stack details, and architectural patterns for ShaderGraph. All AI agents and contributors must adhere to these guidelines.

---

## 1. Design Principles & Anti-AI-Slop Rules

### Strict Design Continuity
- **Preserve Established Aesthetic**: Always stick to the existing design system unless explicitly instructed to change it.
- **Studio-Grade Tooling**: Design for technical artists and shader developers. Aim for the feel of production tools like Blender, Unreal Engine Material Editor, Substance Designer, or TouchDesigner.

### Zero AI Slop Policy
With every design change or new component, actively refine the UI to be **less AI slop**:
- **NO Generic SaaS Badges**: Do not add pastel glowing badge circles (e.g. colored `1`, `2`, `3` step indicators), cheesy gradient blobs, or sparkle decorations (`Sparkles` icons used as decorative fluff).
- **NO Marketing Fluff / Syrupy Copy**: Never use patronizing onboarding text like "Aha!", "Watch the magic happen!", "Easy as 1-2-3!", or "Unlock your creativity!". Use precise, concise, technical language (e.g. "Spawn", "Route", "Cast", "Transpile", "Topological Sort").
- **High Information Density**: Prefer compact, high-density layouts with clean monospace metadata over giant empty cards with tiny bits of text.
- **Palette Consistency**:
  - **Dark Mode (Default)**: Deep neutral zinc (`bg-zinc-950`, `bg-zinc-900`, `border-zinc-800`, `border-zinc-700/80`, `text-zinc-100/200/400`).
  - **Light Mode**: Warm, low-glare stone tones (`#e4e4e8`, `#f3f3f6`). Never use blinding, stark `#ffffff` canvas backgrounds.
  - **Syntax & Port Accents**: Use subdued semantic color codes: Emerald for Inputs, Cyan for Math/Ops, Purple for Procedural/Noise, Teal for UV, Amber for Output/Master, Sky for Wireframes.
- **Controls & Keycaps**: Use authentic `<kbd>` keycap styling with subtle borders for shortcuts (`Tab`, `Ctrl+D`, `Ctrl+Z`, `Backspace`).

---

## 2. Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Framework** | [React 19](https://react.dev/) + [Vite](https://vite.dev/) | Fast HMR and modern bundling |
| **Node Graph** | [@xyflow/react](https://reactflow.dev/) (React Flow) | Canvas, custom nodes, handles, mini-map, controls |
| **3D Rendering** | [Three.js](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/) + [@react-three/drei](https://github.com/pmndrs/drei) | WebGL2 live shader viewport with OrbitControls |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern CSS-first Tailwind configuration |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) | Global graph store (`useGraphStore.ts`) with undo/redo history |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, monochrome technical iconography |
| **Testing** | [Vitest](https://vitest.dev/) | Unit tests for compiler DAG, cycle detection, and store operations |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Strict type checking (`tsc -b`) |

---

## 3. Project Structure

```
ShaderGraph/
├── README.md               # User-facing documentation and feature overview
├── AGENTS.md               # Agent guidelines, design rules, and architecture (this file)
├── CLAUDE.md               # Anthropic Claude specific project guide
├── LICENSE                 # MIT License
└── frontend/               # Single-page web application
    ├── index.html          # HTML entry point with dark theme meta
    ├── package.json        # Dependencies and build scripts
    ├── vite.config.ts      # Vite & React plugin configuration
    └── src/
        ├── App.tsx         # Main layout, canvas wrapper, global keyboard shortcuts
        ├── main.tsx        # React 19 root bootstrap
        ├── index.css       # Tailwind v4 import, custom scrollbars, canvas theme rules
        ├── components/
        │   ├── graph/
        │   │   ├── CustomNode.tsx       # Universal node UI (headers, inputs, outputs, isolated sliders)
        │   │   ├── CustomEdge.tsx       # Curved bezier connection wires
        │   │   └── QuickSearchModal.tsx # Spotlight search menu (Tab / Right-Click)
        │   ├── layout/
        │   │   ├── Header.tsx           # Main toolbar (Undo/Redo, Workspaces, Compile, Texture Export, Theme)
        │   │   ├── Sidebar.tsx          # Categorized drag-and-drop node library
        │   │   ├── WorkspaceModal.tsx   # Workspace manager (Samples, Save, Load, JSON Import/Export)
        │   │   └── IntroModal.tsx       # Technical reference, dataflow diagram, keybindings
        │   └── preview/
        │       ├── LiveViewport.tsx     # Three.js 3D viewport, geometry picker, wireframe, backgrounds, HUD
        │       └── GLSLViewer.tsx       # Syntax-highlighted GLSL code viewer with 1-click copy
        ├── core/
        │   ├── engine/
        │   │   ├── compiler.ts          # DAG topological sort, cycle prevention, type casting, GLSL codegen
        │   │   ├── compiler.test.ts     # Vitest suite for compiler and sample shaders
        │   │   └── types.ts             # Port, Node, Edge, and Graph data schemas
        │   ├── gl/
        │   │   └── ShaderRenderer.ts    # Off-screen WebGL canvas for 1024x1024 PNG texture baking
        │   ├── nodes/
        │   │   └── registry.ts          # Complete node definitions, port types, and GLSL code templates
        │   └── samples/
        │       └── samples.ts           # Curated procedural shaders (Emerald Marble, Voronoi, Sine Flow)
        └── store/
            ├── useGraphStore.ts         # Zustand store (nodes, edges, undo/redo, persistence, themes)
            └── useGraphStore.test.ts    # Unit tests for history stack and node duplication
```

---

## 4. Key Architectural Patterns

### Compiler & DAG Resolution
- All graph evaluation is handled by `compiler.ts`.
- Evaluates dependencies starting from the `masterOutput` sink node backwards.
- Prevents infinite recursion via visited-set cycle detection.
- Handles automatic type promotions:
  - `float` promoted to `vec2(v)` / `vec3(v)` / `vec4(v, v, v, 1.0)`.
  - `vec4` swizzled to `vec3(v.xyz)` or `float(v.r)`.

### State Management & Undo / Redo
- `useGraphStore.ts` maintains snapshot stacks (`past` and `future`, capped at 30 entries).
- State mutations that affect graph topology (`addNode`, `deleteNode`, `onConnect`, `duplicateSelectedNodes`) must call `pushHistory()` before mutating state.
- Sliders and inline inputs must use `nodrag`, `nopan`, and `stopPropagation` to ensure dragging parameters never inadvertently moves the node or canvas.

---

## 5. Development Commands

Always run commands within the `frontend/` directory:

```bash
cd frontend

# Start development server
npm run dev

# Run TypeScript typecheck and production bundle build
npm run build

# Run automated Vitest test suite
npx vitest run
```
