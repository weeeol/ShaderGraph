import { describe, it, expect, beforeEach } from 'vitest';
import { useGraphStore } from './useGraphStore';

describe('useGraphStore history and workflow superpowers', () => {
  beforeEach(() => {
    useGraphStore.getState().newGraph();
  });

  it('should push history and support undo and redo when adding nodes', () => {
    const store = useGraphStore.getState();
    const initialNodeCount = store.nodes.length;

    // Add a node
    store.addNode('simplex2d', { x: 100, y: 100 });
    expect(useGraphStore.getState().nodes.length).toBe(initialNodeCount + 1);
    expect(useGraphStore.getState().past.length).toBe(1);
    expect(useGraphStore.getState().future.length).toBe(0);

    // Undo
    useGraphStore.getState().undo();
    expect(useGraphStore.getState().nodes.length).toBe(initialNodeCount);
    expect(useGraphStore.getState().past.length).toBe(0);
    expect(useGraphStore.getState().future.length).toBe(1);

    // Redo
    useGraphStore.getState().redo();
    expect(useGraphStore.getState().nodes.length).toBe(initialNodeCount + 1);
    expect(useGraphStore.getState().past.length).toBe(1);
    expect(useGraphStore.getState().future.length).toBe(0);
  });

  it('should duplicate selected nodes preserving data and offsetting position', () => {
    const store = useGraphStore.getState();
    store.addNode('simplex2d', { x: 150, y: 200 });

    const added = useGraphStore.getState().nodes.find(n => n.type === 'simplex2d')!;
    // Set custom data and select it
    useGraphStore.getState().updateNodeData(added.id, 'scale', 8.5);
    useGraphStore.setState({
      nodes: useGraphStore.getState().nodes.map(n => n.id === added.id ? { ...n, selected: true } : n)
    });

    // Duplicate
    useGraphStore.getState().duplicateSelectedNodes();

    const currentNodes = useGraphStore.getState().nodes;
    const duplicates = currentNodes.filter(n => n.type === 'simplex2d');
    expect(duplicates.length).toBe(2);

    const clonedNode = duplicates.find(n => n.id !== added.id)!;
    expect(clonedNode).toBeDefined();
    expect(clonedNode.position.x).toBe(190);
    expect(clonedNode.position.y).toBe(240);
    expect(clonedNode.data.scale).toBe(8.5);
    expect(clonedNode.selected).toBe(true);
  });
});
