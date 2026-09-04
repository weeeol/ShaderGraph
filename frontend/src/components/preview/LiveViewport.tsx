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
  const { compilerError } = useGraphStore();

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden group bg-[#0d0d0f]">
      <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-center z-10 bg-gradient-to-b from-secondary/90 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <h3 className="text-[10px] font-bold text-text/80 uppercase tracking-widest pointer-events-auto shadow-black drop-shadow-md">3D Preview</h3>
        <div className="flex gap-2 pointer-events-auto">
          <button 
            onClick={() => setGeometry('box')}
            className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${geometry === 'box' ? 'bg-accent/20 text-accent ring-1 ring-accent' : 'bg-primary/50 text-text-muted hover:text-text hover:bg-primary'}`}
            title="Cube"
          >
            <div className="w-2.5 h-2.5 border-2 border-current rounded-sm"></div>
          </button>
          <button 
            onClick={() => setGeometry('sphere')}
            className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${geometry === 'sphere' ? 'bg-accent/20 text-accent ring-1 ring-accent' : 'bg-primary/50 text-text-muted hover:text-text hover:bg-primary'}`}
            title="Sphere"
          >
            <div className="w-3 h-3 border-2 border-current rounded-full"></div>
          </button>
          <button 
            onClick={() => setGeometry('plane')}
            className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${geometry === 'plane' ? 'bg-accent/20 text-accent ring-1 ring-accent' : 'bg-primary/50 text-text-muted hover:text-text hover:bg-primary'}`}
            title="Plane"
          >
            <div className="w-3 h-1 bg-current rounded-sm"></div>
          </button>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <Canvas camera={{ position: [0, 0, 4] }}>
          <color attach="background" args={['#0d0d0f']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <ShaderMesh geometry={geometry} />
          <OrbitControls />
        </Canvas>
      </div>

      {compilerError && (
        <div className="absolute bottom-4 left-4 right-4 text-red-400 text-center p-4 bg-red-950/80 rounded-xl border border-red-500/30 backdrop-blur-md shadow-2xl max-h-32 overflow-y-auto custom-scrollbar">
          <p className="font-semibold text-[10px] uppercase tracking-wider mb-2">Compilation Error</p>
          <pre className="text-[10px] font-mono text-left whitespace-pre-wrap">{compilerError}</pre>
        </div>
      )}
    </div>
  );
};
