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
import type { GraphNode, GraphEdge } from '../core/engine/types';
import { transpileGraphToGLSL } from '../core/engine/compiler';
import { NODE_REGISTRY } from '../core/nodes/registry';

export interface SavedGraphItem {
  id: string;
  name: string;
  updatedAt: number;
  nodeCount: number;
  nodes: Node[];
  edges: Edge[];
}

const STORAGE_KEY = 'shadergraph_saved_projects';

const getStoredGraphs = (): SavedGraphItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading saved graphs from localStorage', e);
    return [];
  }
};

const setStoredGraphs = (graphs: SavedGraphItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(graphs));
  } catch (e) {
    console.error('Error saving graphs to localStorage', e);
  }
};

const initialNodes: Node[] = [
  {
    id: 'master-node',
    type: 'masterOutput',
    position: { x: 400, y: 200 },
    data: {},
    deletable: false,
  }
];

const initialEdges: Edge[] = [];

export type ThemeMode = 'dark' | 'light';

const getInitialTheme = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('shadergraph_theme') as ThemeMode;
    if (saved === 'light' || saved === 'dark') {
      if (saved === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
      return saved;
    }
  }
  return 'dark';
};

interface GraphStore {
  nodes: Node[];
  edges: Edge[];
  currentGraphName: string;
  savedGraphs: SavedGraphItem[];
  theme: ThemeMode;
  glslCode: string;
  compilerError: string | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  compile: () => void;
  updateNodeData: (nodeId: string, portId: string, value: any) => void;
  addNode: (type: string, position: { x: number, y: number }) => void;
  deleteNode: (nodeId: string) => void;
  loadGraph: (nodes: Node[], edges: Edge[], name?: string) => void;
  newGraph: () => void;
  saveCurrentGraph: (name: string) => void;
  deleteSavedGraph: (id: string) => void;
  loadSavedGraphsList: () => void;
  toggleTheme: () => void;
}

let nodeIdCounter = 1;

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  currentGraphName: 'Untitled Graph',
  savedGraphs: getStoredGraphs(),
  theme: getInitialTheme(),
  glslCode: '',
  compilerError: null,
  
  toggleTheme: () => {
    const nextTheme: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
    set({ theme: nextTheme });
    localStorage.setItem('shadergraph_theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  },
  
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

  addNode: (type: string, position: { x: number, y: number }) => {
    const newNode: Node = {
      id: "node_" + (nodeIdCounter++) + "_" + Date.now(),
      type,
      position,
      data: {},
    };
    set({ nodes: [...get().nodes, newNode] });
    get().compile();
  },

  deleteNode: (nodeId: string) => {
    if (nodeId === 'master-node') return; // Cannot delete master node
    set({
      nodes: get().nodes.filter(n => n.id !== nodeId),
      edges: get().edges.filter(e => e.source !== nodeId && e.target !== nodeId)
    });
    get().compile();
  },

  loadGraph: (nodes: Node[], edges: Edge[], name = 'Untitled Graph') => {
    set({
      nodes,
      edges,
      currentGraphName: name,
    });
    get().compile();
  },

  newGraph: () => {
    set({
      nodes: [
        {
          id: 'master-node',
          type: 'masterOutput',
          position: { x: 400, y: 200 },
          data: {},
          deletable: false,
        }
      ],
      edges: [],
      currentGraphName: 'Untitled Graph',
    });
    get().compile();
  },

  saveCurrentGraph: (name: string) => {
    const { nodes, edges } = get();
    const trimmedName = name.trim() || get().currentGraphName || 'Untitled Graph';
    const existing = getStoredGraphs();
    const existingIndex = existing.findIndex(g => g.name === trimmedName);
    const newGraph: SavedGraphItem = {
      id: existingIndex >= 0 ? existing[existingIndex].id : 'graph_' + Date.now(),
      name: trimmedName,
      updatedAt: Date.now(),
      nodeCount: nodes.length,
      nodes,
      edges,
    };

    let updated: SavedGraphItem[];
    if (existingIndex >= 0) {
      updated = [...existing];
      updated[existingIndex] = newGraph;
    } else {
      updated = [newGraph, ...existing];
    }
    setStoredGraphs(updated);
    set({ savedGraphs: updated, currentGraphName: trimmedName });
  },

  deleteSavedGraph: (id: string) => {
    const existing = getStoredGraphs();
    const updated = existing.filter(g => g.id !== id);
    setStoredGraphs(updated);
    set({ savedGraphs: updated });
  },

  loadSavedGraphsList: () => {
    set({ savedGraphs: getStoredGraphs() });
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

    // Find master output node
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
