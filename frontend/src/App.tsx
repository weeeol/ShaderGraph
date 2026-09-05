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
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, compile, addNode, theme } = useGraphStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDockOpen, setIsDockOpen] = useState(true);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);
  const [isIntroOpen, setIsIntroOpen] = useState(false);

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

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // project the screen coordinates to the react flow canvas coordinates
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [screenToFlowPosition, addNode],
  );

  return (
    <div className="w-screen h-screen flex flex-col bg-primary overflow-hidden text-text selection:bg-accent/30">
      <Header 
        isSidebarOpen={isSidebarOpen} 
        isDockOpen={isDockOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        toggleDock={() => setIsDockOpen(!isDockOpen)}
        onOpenIntro={() => setIsIntroOpen(true)}
        onOpenWorkspace={() => setIsWorkspaceOpen(true)}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        {isSidebarOpen && (
          <div className="w-60 h-full shrink-0 z-10 transition-all duration-200 relative">
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
          <div className="w-[420px] h-full flex flex-col shrink-0 z-10 border-l border-zinc-800/80 bg-zinc-950 transition-all duration-200">
            <div className="h-[360px] shrink-0 border-b border-zinc-800/80">
              <LiveViewport />
            </div>
            <div className="flex-1 min-h-[200px]">
              <GLSLViewer />
            </div>
          </div>
        )}
      </div>

      {/* First-load Intro Modal */}
      <IntroModal 
        isOpen={isIntroOpen} 
        onClose={handleCloseIntro} 
      />

      {/* Open Workspace Launcher */}
      <WorkspaceModal 
        isOpen={isWorkspaceOpen} 
        onClose={() => setIsWorkspaceOpen(false)} 
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
