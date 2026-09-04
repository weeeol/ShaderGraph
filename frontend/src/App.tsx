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
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, compile, addNode } = useGraphStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDockOpen, setIsDockOpen] = useState(true);

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
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        {isSidebarOpen && (
          <div className="w-64 h-full shrink-0 z-10 shadow-2xl transition-all duration-300 relative">
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
            className="bg-primary"
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#27272a" gap={24} size={1.5} />
            <Controls className="!bg-secondary !border-border !fill-text-muted hover:!fill-text shadow-xl rounded-lg overflow-hidden" />
            <MiniMap 
              nodeColor="#6366f1" 
              maskColor="rgba(9, 9, 11, 0.7)" 
              className="bg-secondary/80 backdrop-blur-md border border-border rounded-lg shadow-xl"
            />
          </ReactFlow>
        </div>

        {/* Right Dock */}
        {isDockOpen && (
          <div className="w-[400px] h-full flex flex-col shrink-0 z-10 border-l border-border bg-secondary/95 shadow-2xl transition-all duration-300">
            <div className="h-[350px] shrink-0 border-b border-border/50">
              <LiveViewport />
            </div>
            <div className="flex-1 min-h-[200px]">
              <GLSLViewer />
            </div>
          </div>
        )}
      </div>
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
