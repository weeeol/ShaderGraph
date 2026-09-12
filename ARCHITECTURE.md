# ShaderGraph Architecture

## System overview

ShaderGraph is a browser-only visual editor for fragment shaders. Users compose a directed acyclic graph (DAG) of typed shader nodes; the application transpiles the graph to GLSL ES 3.00, previews it on a Three.js mesh, and can bake it to a PNG. Graphs and UI preferences are retained only in the browser.

There is no backend service, database, remote API, authentication, or multi-user collaboration in the current product.

## Technology stack

| Concern | Technology |
| --- | --- |
| Application | React 19, TypeScript, Vite |
| Styling | Tailwind CSS v4 |
| Graph canvas | `@xyflow/react` |
| State | Zustand |
| Viewport | Three.js, `@react-three/fiber`, `@react-three/drei` |
| Icons | Lucide React |
| Tests | Vitest |
| CI | GitHub Actions with Node 20 |

## Frontend architecture

The application is a single Vite bundle rooted at `frontend/src/main.tsx`. `App.tsx` owns editor-shell layout, canvas wiring, modal visibility, drag-and-drop, and global keyboard shortcuts. It composes feature-oriented components:

- `components/graph/`: React Flow node, edge, and quick-search presentation.
- `components/layout/`: header, node library, workspace, and reference UI.
- `components/preview/`: the Three.js shader preview and generated GLSL viewer.
- `core/engine/`: graph contracts, type casts, dependency resolution, and GLSL generation.
- `core/nodes/`: declarative node definitions and GLSL templates.
- `core/samples/`: immutable sample graph data.
- `core/gl/`: direct WebGL2 off-screen renderer for PNG baking.
- `store/`: global graph state, history, compilation state, theme, and browser persistence.

Components must remain presentational where practical. Graph invariants, persistence, history, and compilation are store/core responsibilities, not UI concerns.

## Data flow

1. A canvas, keyboard, sidebar, or modal action invokes a Zustand store operation.
2. The store updates React Flow `Node`/`Edge` data and runs `compile()`.
3. `compile()` adapts React Flow types to core `GraphNode`/`GraphEdge` contracts and calls `transpileGraphToGLSL()`.
4. The compiler selects nodes reachable from the master output, topologically sorts them, detects cycles, performs supported casts, and emits fragment GLSL.
5. The resulting GLSL or compiler error is exposed from the store to the GLSL viewer and viewport.
6. The viewport builds a `RawShaderMaterial`; texture baking uses the standalone WebGL2 renderer.

## Graph and compiler contracts

`core/engine/types.ts` defines the stable, framework-independent graph contract:

- `DataType`: `float`, `vec2`, `vec3`, `vec4`, or `sampler2D`.
- `NodeDefinition`: ports and an optional GLSL template.
- `GraphNode` and `GraphEdge`: serializable graph topology and node data.

`core/nodes/registry.ts` is the single source of truth for node type IDs, port IDs/types/defaults, and template placeholders. A node definition must be added there before a UI node can be instantiated.

The master output is a required, non-deletable sink. A compiler feature must preserve backwards traversal from this sink, reject reachable cycles, and keep generated identifiers valid GLSL. New casts must be explicit in `glsl-utils.ts` and covered by compiler tests.

## State and persistence

`useGraphStore.ts` owns editor state. Topology-changing operations must snapshot the current graph through `pushHistory()` before mutation. History contains up to 30 deep-cloned `{nodes, edges}` snapshots; undo and redo must recompile after restoration.

Saved workspaces are stored in browser `localStorage` under `shadergraph_saved_projects`; theme preference uses `shadergraph_theme`. Import/export operates on user-selected JSON files in the browser. Persistence data is untrusted and must be validated before it is admitted to the active graph when import validation is introduced or changed.

## Backend, database, and API architecture

Not applicable. No server, database schema, network API, credentials, roles, or authorization model exists. Any feature requiring remote storage, sharing, accounts, or server-side shader processing requires a new architectural decision and dedicated task specification before implementation.

## Authentication and authorization

Not applicable in the current local-only product. Browser-local data must not be described as secure, private, or synchronized.

## External services

The runtime does not depend on external services. npm packages are consumed at build time; GitHub Actions runs CI on pushes and pull requests targeting `main` or `dev`.

## Security requirements

- Treat imported JSON and browser persistence as untrusted data; validate shape, node type IDs, port IDs, and finite numeric parameter values before use.
- Do not introduce secret-bearing client configuration. Client-side values are public by definition.
- Keep shader source generated from registry-controlled templates and typed parameter serialization; do not add arbitrary user-supplied GLSL execution without a sandboxing and abuse-risk decision.
- Keep file import constrained to explicit user gesture and expected graph data; do not upload imported content by default.

## Testing strategy

Vitest covers compiler traversal/cycle detection/sample compilation and key store history workflows. Every compiler, registry, casting, or persistence change must include focused unit coverage. UI changes with interaction risk should add component or browser-level coverage when a test harness is added; until then, verify the affected workflow manually in both themes.

CI runs linting, `npx vitest run`, and `npm run build` from `frontend/`.

## Deployment architecture

Vite produces static assets in `frontend/dist`. The repository does not currently configure hosting, releases, environment variables, CDN rules, or deployment automation. Static hosting is the compatible deployment model unless a future architecture decision adds server capabilities.

## Important decisions and constraints

- Retain the existing React/React Flow/Three.js/Zustand stack. A new framework or state system needs an explicit architecture decision.
- Keep core compiler contracts independent of React Flow so compilation remains unit-testable.
- Preserve the studio-grade zinc/stone visual system and semantic port colors in `AGENTS.md`.
- Interactive controls inside graph nodes must use `nodrag`, `nopan`, and event propagation guards.
- Avoid unnecessary dependencies and keep new capabilities as small, independently specified tasks under `docs/tasks/`.

## Current architectural risks and technical debt

1. The initial production bundle is approximately 1.36 MB before compression and triggers Vite's chunk-size warning. Code-split heavy preview/workspace features before adding substantial UI dependencies.
2. Lint emits four React warnings: synchronous state updates in effects in QuickSearch and WorkspaceModal, and an impure `performance.now()` initialization in LiveViewport. Address these before treating lint warnings as an acceptable baseline.
3. Imported and persisted graphs are parsed but do not yet have a dedicated schema validation boundary. Invalid topology, unknown types, or malformed parameter values can reach runtime code.
4. Some application paths mutate Zustand state directly from `App.tsx`, bypassing the store's history boundary. New graph mutations must go through store actions, and the existing starter-node path should be corrected in a focused maintenance task.
5. The viewport creates shader materials from emitted source but has no isolated WebGL compilation/error-reporting contract equivalent to `ShaderRenderer`; runtime GLSL errors may have less actionable diagnostics than compiler errors.
