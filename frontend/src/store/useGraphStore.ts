import { create } from 'zustand';
import type { 
  Connection, 
  Edge, 
  EdgeChange, 
  Node, 
  NodeChange, 
  OnNodesChange, 
  OnEdgesChange, 
  OnConnect
} from '@xyflow/react';
import { 
  addEdge, 
  applyNodeChanges,
  applyEdgeChanges
} from '@xyflow/react';
import type { GraphNode, GraphEdge, NodeDefinition } from '../core/engine/types';
import type { NodeRegistry } from '../core/engine/compiler';
import { transpileGraphToGLSL } from '../core/engine/compiler';

import { NODE_REGISTRY } from '../core/nodes/registry';
const initialNodes: Node[] = [
  {
    id: 'master-node',
    type: 'masterOutput',
    position: { x: 400, y: 200 },
    data: {},
  }
];

const initialEdges: Edge[] = [];

interface GraphStore {
  nodes: Node[];
  edges: Edge[];
  glslCode: string;
  compilerError: string | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  compile: () => void;
  updateNodeData: (nodeId: string, portId: string, value: any) => void;
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  glslCode: '',
  compilerError: null,
  
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
    get().compile();
  },
  
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
    get().compile();
  },
  
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
    get().compile();
  },

  updateNodeData: (nodeId: string, portId: string, value: any) => {
    set({
      nodes: get().nodes.map(n => 
        n.id === nodeId ? { ...n, data: { ...n.data, [portId]: value } } : n
      )
    });
    get().compile();
  },

  compile: () => {
    const { nodes, edges } = get();
    
    // Adapt React Flow nodes to our GraphNode format
    const graphNodes: GraphNode[] = nodes.map(n => ({
      id: n.id,
      type: n.type || 'unknown',
      position: n.position,
      data: n.data as any
    }));

    const graphEdges: GraphEdge[] = edges.map(e => ({
      id: e.id,
      source: e.source,
      sourceHandle: e.sourceHandle || 'default',
      target: e.target,
      targetHandle: e.targetHandle || 'default'
    }));

    // Find master output node (assuming its id or type identifies it)
    const masterNode = graphNodes.find(n => n.type === 'masterOutput');
    
    if (!masterNode) {
      set({ compilerError: 'No Master Output node found.', glslCode: '' });
      return;
    }

    const { glslCode, error } = transpileGraphToGLSL(graphNodes, graphEdges, masterNode.id, NODE_REGISTRY);

    set({ 
      glslCode: glslCode || '', 
      compilerError: error || null 
    });
  }
}));
