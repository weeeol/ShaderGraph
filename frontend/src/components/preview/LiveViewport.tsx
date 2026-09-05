import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGraphStore } from '../../store/useGraphStore';

const VERTEX_SHADER = "in vec3 position;\n" +
"in vec2 uv;\n" +
"uniform mat4 modelViewMatrix;\n" +
"uniform mat4 projectionMatrix;\n" +
"out vec2 v_uv;\n" +
"void main() {\n" +
"    v_uv = uv;\n" +
"    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n" +
"}\n";

const ShaderMesh = ({ geometry }: { geometry: 'plane' | 'box' | 'sphere' }) => {
  const { glslCode, compilerError } = useGraphStore();
  const materialRef = useRef<THREE.RawShaderMaterial>(null);
  
  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(800, 600) },
    u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
    u_frame: { value: 0 }
  }), []);

  const material = useMemo(() => {
    // If there's a compiler error, fallback to a simple error shader
    if (compilerError || !glslCode) {
      return new THREE.MeshBasicMaterial({ color: 'red', wireframe: true });
    }

    return new THREE.RawShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: glslCode.replace('#version 300 es', ''),
      uniforms,
      glslVersion: THREE.GLSL3,
      side: THREE.DoubleSide,
    });
  }, [glslCode, compilerError, uniforms]);

  useFrame((state) => {
    if (materialRef.current && (materialRef.current as any).uniforms) {
      const mat = materialRef.current as THREE.RawShaderMaterial;
      mat.uniforms.u_time.value = state.clock.elapsedTime;
      mat.uniforms.u_frame.value += 1;
      // In a real app, track mouse over the canvas and update u_mouse
    }
  });

  return (
    <mesh>
      {geometry === 'plane' && <planeGeometry args={[2, 2]} />}
      {geometry === 'box' && <boxGeometry args={[2, 2, 2]} />}
      {geometry === 'sphere' && <sphereGeometry args={[1.5, 64, 64]} />}
      
      {compilerError ? (
        <meshBasicMaterial color="red" wireframe />
      ) : (
        <primitive object={material} ref={materialRef} attach="material" />
      )}
    </mesh>
  );
};

export const LiveViewport = () => {
  const [geometry, setGeometry] = useState<'plane' | 'box' | 'sphere'>('box');
  const { compilerError, theme } = useGraphStore();

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden bg-zinc-950">
      {/* Permanent Viewport Toolbar */}
      <div className="px-3.5 py-2 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">3D Viewport</h3>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">
            WebGL2
          </span>
        </div>

        {/* Geometry Segmented Switcher */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md p-0.5">
          <button 
            onClick={() => setGeometry('box')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
              geometry === 'box' 
                ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-xs' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Cube Mesh"
          >
            Cube
          </button>
          <button 
            onClick={() => setGeometry('sphere')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
              geometry === 'sphere' 
                ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-xs' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Sphere Mesh"
          >
            Sphere
          </button>
          <button 
            onClick={() => setGeometry('plane')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
              geometry === 'plane' 
                ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-xs' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Plane Quad"
          >
            Plane
          </button>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <Canvas camera={{ position: [0, 0, 4] }}>
          <color attach="background" args={[theme === 'light' ? '#25252b' : '#09090b']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <ShaderMesh geometry={geometry} />
          <OrbitControls />
        </Canvas>
      </div>

      {compilerError && (
        <div className="absolute bottom-4 left-4 right-4 text-red-300 p-3 bg-red-950/90 rounded-lg border border-red-800/80 backdrop-blur-md shadow-2xl max-h-32 overflow-y-auto custom-scrollbar font-mono text-xs">
          <div className="font-semibold text-[10px] text-red-400 uppercase tracking-wider mb-1">Shader Compilation Error</div>
          <pre className="text-xs whitespace-pre-wrap">{compilerError}</pre>
        </div>
      )}
    </div>
  );
};
