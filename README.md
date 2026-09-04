# ShaderGraph

ShaderGraph is a modern, web-based node editor for visually authoring WebGL2 shaders. Built with a focus on premium aesthetics and real-time performance, it allows you to construct complex GLSL shaders using a highly intuitive graph interface and instantly preview the results in a 3D viewport.

## Features

- **Visual Shader Editing**: Build GLSL shaders seamlessly by connecting nodes in a powerful and responsive graph built with React Flow.
- **Real-Time 3D Preview**: Instantly preview your shader on different geometry (Plane, Cube, Sphere) powered by Three.js and WebGL2.
- **Dynamic GLSL Generation**: Under the hood, your graph is dynamically compiled into clean, optimized `#version 300 es` GLSL code in real-time.
- **Smart Type Casting Engine**: Math nodes seamlessly handle both scalar (`float`) and vector (`vec2`, `vec3`, `vec4`) data types, automatically casting and adapting based on the connections you make—just like industry-standard node editors.
- **Premium UI & Layout**: A sleek, dark-mode "Zinc" design featuring glassmorphism, glowing node rings, custom scrollbars, and a fully resizable 3-column flex layout (Sidebar, Canvas, Dock) that maximizes your workspace.
- **Texture Baking**: Export the generated procedural textures directly to PNG files via off-screen WebGL rendering.
- **Advanced Node Controls**: Tweak parameters using inline range sliders and hex/alpha color pickers.

## Tech Stack

- **Frontend Framework**: React 18 with Vite
- **Node Graph**: `@xyflow/react` (React Flow)
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **3D Engine**: Three.js & `@react-three/fiber`
- **Language**: TypeScript

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation

1. Clone the repository and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

### Build for Production
To build the application for production, run:
```bash
npm run build
```
This will compile TypeScript and bundle the assets into the `dist` folder.

## Usage

1. **Add Nodes**: Drag and drop nodes from the Left Sidebar into the canvas.
2. **Connect**: Click and drag between node handles to create data flow connections. The engine handles type casting automatically.
3. **Tweak**: Use the inline sliders and color pickers to tweak uniforms and constants.
4. **Preview**: See your shader update live in the right-hand Preview Dock. Switch the preview geometry between Cube, Sphere, or Plane using the toggle buttons.
5. **Inspect & Export**: Check the raw GLSL output in the bottom right panel. When you're happy with your shader, click **Export Texture** in the top header to bake the shader to a PNG image.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.