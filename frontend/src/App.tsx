import { useCallback, useRef, useEffect, useState } from 'react';
import type { DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useGraphStore } from './store/useGraphStore';
import { CustomNode } from './components/graph/CustomNode';
import { Header } from './components/layout/Header';
import { IntroModal } from './components/layout/IntroModal';
import { WorkspaceModal } from './components/layout/WorkspaceModal';
import { QuickSearchModal } from './components/graph/QuickSearchModal';
import { LiveViewport } from './components/preview/LiveViewport';
import { GLSLViewer } from './components/preview/GLSLViewer';
import { Sidebar } from './components/layout/Sidebar';
import { CustomEdge } from './components/graph/CustomEdge';
import { NODE_REGISTRY } from './core/nodes/registry';

const nodeTypes = Object.keys(NODE_REGISTRY).reduce((acc, key) => {
  acc[key] = CustomNode;
  return acc;
}, {} as Record<string, React.ComponentType<any>>);

const edgeTypes = {
  default: CustomEdge,
};

function ShaderGraph() {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    compile, 
    addNode, 
    theme,
    undo,
    redo,
    duplicateSelectedNodes
  } = useGraphStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [isDockOpen, setIsDockOpen] = useState(true);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);
  const [isIntroOpen, setIsIntroOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchPosition, setSearchPosition] = useState<{ x: number; y: number } | null>(null);

  const handleGraphLoaded = useCallback(() => {
    requestAnimationFrame(() => {
      fitView({
        padding: 0.18,
        maxZoom: 1.0,
        duration: 200,
      });
    });
  }, [fitView]);

  const mousePositionRef = useRef<{ x: number; y: number }>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
  });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mousePositionRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Global Keyboard Shortcuts (Tab, Ctrl+Z, Ctrl+Y, Ctrl+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Tab -> Open Node Search at cursor
      if (e.key === 'Tab') {
        e.preventDefault();
        setSearchPosition({ ...mousePositionRef.current });
        setIsSearchOpen(true);
        return;
      }

      const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCtrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      if (isCtrlOrCmd) {
        // Undo / Redo (Ctrl+Z, Ctrl+Shift+Z)
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          return;
        }

        // Redo (Ctrl+Y)
        if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          redo();
          return;
        }

        // Duplicate selected nodes (Ctrl+D)
        if (e.key.toLowerCase() === 'd') {
          e.preventDefault();
          duplicateSelectedNodes();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, duplicateSelectedNodes]);

  const handleCloseIntro = (dontShowAgain?: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem('shadergraph_intro_seen', 'true');
    }
    setIsIntroOpen(false);
  };

  useEffect(() => {
    compile();
  }, [compile]);

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [screenToFlowPosition, addNode],
  );

  const handleSelectNodeFromSearch = (nodeType: string) => {
    const targetScreenPos = searchPosition || mousePositionRef.current;
    const flowPos = screenToFlowPosition({
      x: targetScreenPos.x,
      y: targetScreenPos.y,
    });
    addNode(nodeType, flowPos);
  };

  const handleAddStarterNode = () => {
    const uvNodeId = "node_uv_" + Date.now();
    const uvNode = {
      id: uvNodeId,
      type: 'uv',
      position: { x: 80, y: 200 },
      data: {},
    };
    const masterEdge = {
      id: `xy-edge__${uvNodeId}uv-master-nodecolor`,
      source: uvNodeId,
      target: 'master-node',
      sourceHandle: 'uv',
      targetHandle: 'color',
    };
    useGraphStore.setState({
      nodes: [...useGraphStore.getState().nodes, uvNode],
      edges: [...useGraphStore.getState().edges, masterEdge],
    });
    compile();
    setIsIntroOpen(false);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-primary overflow-hidden text-text selection:bg-accent/30">
      <Header 
        isSidebarOpen={isSidebarOpen} 
        isDockOpen={isDockOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        toggleDock={() => setIsDockOpen(!isDockOpen)}
        onOpenIntro={() => setIsIntroOpen(true)}
        onOpenWorkspace={() => setIsWorkspaceOpen(true)}
        onOpenQuickSearch={() => {
          setSearchPosition({ ...mousePositionRef.current });
          setIsSearchOpen(true);
        }}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        {isSidebarOpen && (
          <div className="w-52 sm:w-56 lg:w-60 h-full shrink-0 z-10 transition-all duration-200 relative">
            <Sidebar />
          </div>
        )}

        {/* Main Graph Area */}
        <div className="flex-1 flex flex-col relative h-full min-w-0" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={{ type: 'default' }}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            fitView
            onDragOver={onDragOver}
            onDrop={onDrop}
            onPaneContextMenu={(event) => {
              event.preventDefault();
              setSearchPosition({ x: event.clientX, y: event.clientY });
              setIsSearchOpen(true);
            }}
            className="bg-zinc-950"
            proOptions={{ hideAttribution: true }}
          >
            <Background color={theme === 'light' ? '#c4c4ca' : '#27272a'} gap={20} size={1} />
            <Controls className="shadow-lg" showInteractive={false} />
            <MiniMap 
              nodeColor={theme === 'light' ? '#8e8e99' : '#52525b'} 
              nodeStrokeColor={theme === 'light' ? '#71717e' : '#71717a'}
              bgColor={theme === 'light' ? '#e4e4e8' : '#09090b'}
              maskColor={theme === 'light' ? 'rgba(228, 228, 232, 0.75)' : 'rgba(9, 9, 11, 0.8)'} 
              maskStrokeColor={theme === 'light' ? '#4f46e5' : '#71717a'}
              className="shadow-lg"
            />
          </ReactFlow>
        </div>

        {/* Right Dock */}
        {isDockOpen && (
          <div className="w-[320px] sm:w-[380px] lg:w-[430px] xl:w-[470px] h-full flex flex-col shrink-0 z-10 border-l border-zinc-800/80 bg-zinc-950 transition-all duration-200">
            <div className="h-[330px] lg:h-[390px] shrink-0 border-b border-zinc-800/80">
              <LiveViewport />
            </div>
            <div className="flex-1 min-h-[180px]">
              <GLSLViewer />
            </div>
          </div>
        )}
      </div>

      {/* Quick Search Spotlight Modal (Tab / Right-Click) */}
      <QuickSearchModal
        isOpen={isSearchOpen}
        position={searchPosition}
        onClose={() => setIsSearchOpen(false)}
        onSelectNode={handleSelectNodeFromSearch}
      />

      {/* First-load Intro / Tutorial Modal */}
      <IntroModal 
        isOpen={isIntroOpen} 
        onClose={handleCloseIntro}
        onAddStarterNode={handleAddStarterNode}
      />

      {/* Open Workspace Launcher */}
      <WorkspaceModal 
        isOpen={isWorkspaceOpen} 
        onClose={() => setIsWorkspaceOpen(false)} 
        onNewBlankGraph={() => {
          setIsIntroOpen(true);
        }}
        onGraphLoaded={handleGraphLoaded}
      />
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <ShaderGraph />
    </ReactFlowProvider>
  );
}
