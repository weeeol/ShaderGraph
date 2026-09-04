import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useGraphStore } from './store/useGraphStore';
import { CustomNode } from './components/graph/CustomNode';
import { Header } from './components/layout/Header';
import { LiveViewport } from './components/preview/LiveViewport';
import { GLSLViewer } from './components/preview/GLSLViewer';
import { NODE_REGISTRY } from './core/nodes/registry';

// Map all node types to our CustomNode component
const nodeTypes = Object.keys(NODE_REGISTRY).reduce((acc, key) => {
  acc[key] = CustomNode;
  return acc;
}, {} as Record<string, React.ComponentType<any>>);

function ShaderGraph() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, compile } = useGraphStore();
  
  // Compile on mount
  useEffect(() => {
    compile();
  }, [compile]);

  return (
    <div className="w-screen h-screen flex flex-col bg-primary overflow-hidden text-text selection:bg-accent/30">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main Graph Area */}
        <div className="flex-1 flex flex-col relative h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            fitView
            className="bg-primary"
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#3f3f4e" gap={20} size={1} />
            <Controls className="bg-secondary border-border fill-text shadow-lg" />
            <MiniMap 
              nodeColor="#3b82f6" 
              maskColor="rgba(30, 30, 36, 0.7)" 
              className="bg-secondary border border-border"
            />
          </ReactFlow>
        </div>

        {/* Right Dock */}
        <div className="w-[400px] h-full flex flex-col border-l border-border shrink-0 z-10 bg-secondary shadow-[-4px_0_15px_rgba(0,0,0,0.2)]">
          <div className="h-[400px] shrink-0">
            <LiveViewport />
          </div>
          <div className="flex-1 overflow-hidden">
            <GLSLViewer />
          </div>
        </div>
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
