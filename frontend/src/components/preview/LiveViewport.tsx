import React, { useMemo, useRef, useState } from 'react';
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
    <div className="flex flex-col w-full h-full bg-secondary border-l border-border relative">
      <div className="flex items-center justify-between p-2 bg-primary border-b border-border">
        <h3 className="text-sm font-semibold text-text">Live Preview</h3>
        <div className="flex gap-2">
          <select 
            value={geometry}
            onChange={(e) => setGeometry(e.target.value as any)}
            className="bg-secondary text-xs text-text border border-border p-1 rounded"
          >
            <option value="plane">Plane</option>
            <option value="box">Box</option>
            <option value="sphere">Sphere</option>
          </select>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <Canvas camera={{ position: [0, 0, 4] }}>
          <color attach="background" args={['#1e1e24']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <ShaderMesh geometry={geometry} />
          <OrbitControls />
        </Canvas>
      </div>

      {compilerError && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-900/80 text-red-100 p-2 text-xs font-mono max-h-32 overflow-y-auto whitespace-pre-wrap border-t border-red-500">
          {compilerError}
        </div>
      )}
    </div>
  );
};
