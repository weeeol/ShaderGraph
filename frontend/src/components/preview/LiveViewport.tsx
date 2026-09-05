import { useMemo, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGraphStore } from '../../store/useGraphStore';
import { Activity, Grid, Layers, ChevronDown, ChevronUp, X } from 'lucide-react';

export type GeometryType = 'box' | 'sphere' | 'plane' | 'torusKnot' | 'cylinder';
export type BackgroundType = 'studio' | 'gradient' | 'checkerboard';

interface ViewportStats {
  fps: number;
  drawCalls: number;
  triangles: number;
  elapsedTime: number;
}

const VERTEX_SHADER = `in vec3 position;
in vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
out vec2 v_uv;
void main() {
    v_uv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const renderMeshGeometry = (geometry: GeometryType) => {
  switch (geometry) {
    case 'plane':
      return <planeGeometry args={[2, 2, 32, 32]} />;
    case 'box':
      return <boxGeometry args={[2, 2, 2]} />;
    case 'sphere':
      return <sphereGeometry args={[1.5, 64, 64]} />;
    case 'torusKnot':
      return <torusKnotGeometry args={[1.05, 0.3, 128, 32]} />;
    case 'cylinder':
      return <cylinderGeometry args={[1, 1, 2.2, 48]} />;
  }
};

const ShaderMesh = ({ 
  geometry, 
  showWireframe 
}: { 
  geometry: GeometryType; 
  showWireframe: boolean;
}) => {
  const { glslCode, compilerError } = useGraphStore();
  const materialRef = useRef<THREE.RawShaderMaterial>(null);
  
  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(800, 600) },
    u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
    u_frame: { value: 0 }
  }), []);

  const material = useMemo(() => {
    if (compilerError || !glslCode) {
      return new THREE.MeshBasicMaterial({ color: '#ef4444', wireframe: true });
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
    }
  });

  return (
    <group>
      {/* Primary Shader Mesh */}
      <mesh>
        {renderMeshGeometry(geometry)}
        {compilerError ? (
          <meshBasicMaterial color="#ef4444" wireframe />
        ) : (
          <primitive object={material} ref={materialRef} attach="material" />
        )}
      </mesh>

      {/* Wireframe Overlay Mesh */}
      {showWireframe && !compilerError && (
        <mesh scale={[1.001, 1.001, 1.001]}>
          {renderMeshGeometry(geometry)}
          <meshBasicMaterial 
            wireframe 
            color="#38bdf8" 
            opacity={0.35} 
            transparent 
            depthTest={true}
          />
        </mesh>
      )}
    </group>
  );
};

const StatsTracker = ({ onUpdate }: { onUpdate: (stats: ViewportStats) => void }) => {
  const lastTimeRef = useRef(performance.now());
  const framesRef = useRef(0);
  const fpsRef = useRef(60);

  useFrame(({ gl, clock }) => {
    framesRef.current++;
    const now = performance.now();
    if (now - lastTimeRef.current >= 200) {
      fpsRef.current = Math.round((framesRef.current * 1000) / (now - lastTimeRef.current));
      framesRef.current = 0;
      lastTimeRef.current = now;

      onUpdate({
        fps: fpsRef.current,
        drawCalls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
        elapsedTime: Number(clock.elapsedTime.toFixed(1)),
      });
    }
  });

  return null;
};

const GEO_OPTIONS: Array<{ id: GeometryType; label: string }> = [
  { id: 'box', label: 'Cube' },
  { id: 'sphere', label: 'Sphere' },
  { id: 'plane', label: 'Plane' },
  { id: 'torusKnot', label: 'Torus Knot' },
  { id: 'cylinder', label: 'Cylinder' },
];

export const LiveViewport = () => {
  const [geometry, setGeometry] = useState<GeometryType>('box');
  const [isGeoMenuOpen, setIsGeoMenuOpen] = useState(false);
  const [showWireframe, setShowWireframe] = useState(false);
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('studio');
  const [showStats, setShowStats] = useState(true);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [stats, setStats] = useState<ViewportStats>({
    fps: 60,
    drawCalls: 1,
    triangles: 12,
    elapsedTime: 0,
  });

  const { compilerError, theme } = useGraphStore();

  const handleStatsUpdate = useCallback((newStats: ViewportStats) => {
    setStats(newStats);
  }, []);

  const cycleBackground = () => {
    const modes: BackgroundType[] = ['studio', 'gradient', 'checkerboard'];
    const nextIdx = (modes.indexOf(backgroundType) + 1) % modes.length;
    setBackgroundType(modes[nextIdx]);
  };

  const getBackgroundStyle = (): React.CSSProperties => {
    if (backgroundType === 'checkerboard') {
      return {
        backgroundImage: `
          linear-gradient(45deg, #18181b 25%, transparent 25%),
          linear-gradient(-45deg, #18181b 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #18181b 75%),
          linear-gradient(-45deg, transparent 75%, #18181b 75%)
        `,
        backgroundSize: '16px 16px',
        backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
        backgroundColor: '#09090b',
      };
    }
    if (backgroundType === 'gradient') {
      return {
        background: 'radial-gradient(circle at center, #27272a 0%, #18181b 50%, #09090b 100%)',
      };
    }
    return {
      backgroundColor: theme === 'light' ? '#25252b' : '#09090b',
    };
  };

  const currentGeoLabel = GEO_OPTIONS.find(g => g.id === geometry)?.label || 'Cube';

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden bg-zinc-950">
      {/* Viewport Toolbar */}
      <div className="px-3.5 py-2 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2 shrink-0">
          <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider whitespace-nowrap">3D Viewport</h3>
        </div>

        {/* Viewport Actions & Switchers */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Geometry Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsGeoMenuOpen(!isGeoMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 transition-colors"
              title="Change 3D Geometry"
            >
              <span>{currentGeoLabel}</span>
              <ChevronDown size={12} className="text-zinc-500" />
            </button>

            {isGeoMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsGeoMenuOpen(false)} 
                />
                <div className="absolute right-0 mt-1 w-32 bg-zinc-900 border border-zinc-700/80 rounded-lg shadow-xl py-1 z-40 text-xs font-mono">
                  {GEO_OPTIONS.map((geo) => (
                    <button
                      key={geo.id}
                      onClick={() => {
                        setGeometry(geo.id);
                        setIsGeoMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 transition-colors ${
                        geometry === geo.id
                          ? 'bg-zinc-800 text-zinc-100 font-semibold'
                          : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                      }`}
                    >
                      {geo.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="w-px h-4 bg-zinc-800 mx-0.5" />

          {/* Wireframe Toggle */}
          <button
            onClick={() => setShowWireframe(!showWireframe)}
            className={`p-1.5 rounded-md border text-xs transition-colors ${
              showWireframe
                ? 'bg-sky-950/60 border-sky-600/70 text-sky-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title={showWireframe ? "Disable Wireframe Overlay" : "Enable Wireframe Overlay"}
          >
            <Grid size={13} />
          </button>

          {/* Background Mode Switcher */}
          <button
            onClick={cycleBackground}
            className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-xs transition-colors"
            title={`Background Mode: ${backgroundType.toUpperCase()} (Click to cycle)`}
          >
            <Layers size={13} />
          </button>

          {/* Stats Toggle Button */}
          <button
            onClick={() => setShowStats(!showStats)}
            className={`p-1.5 rounded-md border text-xs transition-colors ${
              showStats
                ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title={showStats ? "Hide Performance HUD" : "Show Performance HUD"}
          >
            <Activity size={13} />
          </button>
        </div>
      </div>
      
      {/* 3D Canvas Canvas Container */}
      <div className="flex-1 relative overflow-hidden" style={getBackgroundStyle()}>
        <Canvas 
          camera={{ position: [0, 0, 3.2] }} 
          gl={{ alpha: true, antialias: true }}
        >
          {backgroundType === 'studio' && (
            <color attach="background" args={[theme === 'light' ? '#25252b' : '#09090b']} />
          )}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          <ShaderMesh 
            geometry={geometry} 
            showWireframe={showWireframe} 
          />
          
          <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
          
          {showStats && <StatsTracker onUpdate={handleStatsUpdate} />}
        </Canvas>

        {/* Collapsible Performance HUD */}
        {showStats && (
          <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-auto">
            <div className="bg-zinc-900/90 border border-zinc-700/70 backdrop-blur-md rounded-lg shadow-xl overflow-hidden font-mono text-[11px] text-zinc-300">
              {/* HUD Header / Compact Pill */}
              <div 
                onClick={() => setIsStatsExpanded(!isStatsExpanded)}
                className="flex items-center gap-2 px-2.5 py-1 cursor-pointer select-none hover:bg-zinc-800/60 transition-colors"
                title="Click to expand/collapse HUD details"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${stats.fps >= 50 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className="font-semibold text-zinc-200">{stats.fps} FPS</span>
                <span className="text-zinc-500">|</span>
                <span className="text-zinc-400">{stats.elapsedTime}s</span>
                {isStatsExpanded ? (
                  <ChevronDown size={12} className="text-zinc-500 ml-1" />
                ) : (
                  <ChevronUp size={12} className="text-zinc-500 ml-1" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowStats(false);
                  }}
                  className="text-zinc-500 hover:text-zinc-200 p-0.5 ml-1 rounded hover:bg-zinc-800 transition-colors"
                  title="Hide HUD"
                >
                  <X size={11} />
                </button>
              </div>

              {/* HUD Expanded Details */}
              {isStatsExpanded && (
                <div className="px-2.5 pb-2 pt-1 border-t border-zinc-800/80 flex flex-col gap-1 text-[10px] text-zinc-400">
                  <div className="flex justify-between gap-4">
                    <span>Draw Calls:</span>
                    <span className="text-zinc-200 font-semibold">{stats.drawCalls}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Triangles:</span>
                    <span className="text-zinc-200 font-semibold">{stats.triangles.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Mesh:</span>
                    <span className="text-zinc-200 capitalize">{geometry}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Compiler Error Overlay */}
      {compilerError && (
        <div className="absolute bottom-4 left-4 right-4 text-red-300 p-3 bg-red-950/90 rounded-lg border border-red-800/80 backdrop-blur-md shadow-2xl max-h-32 overflow-y-auto custom-scrollbar font-mono text-xs z-20">
          <div className="font-semibold text-[10px] text-red-400 uppercase tracking-wider mb-1">Shader Compilation Error</div>
          <pre className="text-xs whitespace-pre-wrap">{compilerError}</pre>
        </div>
      )}
    </div>
  );
};
