# CLAUDE.md — Assistant Guidelines for ShaderGraph

## Core Directives

### 1. Design System & Continuity
- **Stick to the Existing Design**: Never alter, redesign, or replace the established aesthetic unless explicitly requested by the user. Maintain visual harmony across all screens, modals, headers, and controls.
- **Make It Less AI Slop With Every Change**:
  - Strictly avoid generic AI/SaaS design tropes: no colorful glowing number badges (`1`, `2`, `3`), no unnecessary sparkles, no marketing-speak ("magic", "unlock creativity", "easy as 1-2-3").
  - Use technical, terse, professional terminology suitable for game developers and technical artists.
  - Maintain the dark zinc studio aesthetic (`zinc-950`, `zinc-900`, `border-zinc-800`) with high-density information layouts and clean monospace metadata.
  - Preserve dual-theme support (Dark Zinc and warm eye-friendly stone Light Mode `#e4e4e8`).
  - Use authentic `<kbd>` keycaps for shortcuts instead of plain text.

### 2. Interaction Integrity
- Canvas inputs, range sliders, and color pickers must always isolate pointer events (`nodrag`, `nopan`, `e.stopPropagation()`) so adjusting parameters never drags nodes or pans the canvas.
- Always preserve undo/redo history tracking (`pushHistory()`) before destructive or generative graph actions.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Node Graph**: `@xyflow/react` (React Flow v12)
- **3D Engine**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Styling**: Tailwind CSS v4
- **State**: Zustand (global store with undo/redo history)
- **Icons**: Lucide React
- **Testing**: Vitest

---

## Project Structure

```
ShaderGraph/
├── README.md               # Public documentation
├── AGENTS.md               # Agent rules and architecture guide
├── CLAUDE.md               # Claude instructions (this file)
└── frontend/
    ├── src/
    │   ├── App.tsx         # Main application layout, hotkeys, canvas container
    │   ├── main.tsx        # React root entry point
    │   ├── index.css       # Tailwind v4 configuration, custom scrollbars, themes
    │   ├── components/
    │   │   ├── graph/      # CustomNode.tsx, CustomEdge.tsx, QuickSearchModal.tsx
    │   │   ├── layout/     # Header.tsx, Sidebar.tsx, WorkspaceModal.tsx, IntroModal.tsx
    │   │   └── preview/    # LiveViewport.tsx (Three.js 3D), GLSLViewer.tsx (Code)
    │   ├── core/
    │   │   ├── engine/     # compiler.ts (DAG topological sort & codegen), compiler.test.ts, types.ts
    │   │   ├── gl/         # ShaderRenderer.ts (Offscreen WebGL texture baker)
    │   │   ├── nodes/      # registry.ts (Node schemas, ports, and GLSL templates)
    │   │   └── samples/    # samples.ts (Curated procedural shader presets)
    │   └── store/          # useGraphStore.ts (Zustand graph store), useGraphStore.test.ts
    ├── package.json
    └── vite.config.ts
```

---

## Commands

Run all commands from the `frontend/` directory:

```bash
cd frontend

# Development server
npm run dev

# TypeScript typecheck & production bundle
npm run build

# Run unit tests
npx vitest run
```
