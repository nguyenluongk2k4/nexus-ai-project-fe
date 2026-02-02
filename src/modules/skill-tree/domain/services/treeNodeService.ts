/**
 * Tree Node Service - Observable state for skill tree nodes
 * Uses BehaviorSubject for reactive UI updates via WebSocket
 * 
 * PATTERN: Empty → First data shows tree → Subsequent updates
 * - Start with empty nodes (show empty state)
 * - First response creates tree structure
 * - Subsequent responses update existing nodes
 */
import { BehaviorSubject } from 'rxjs';

export interface LearningResource {
  id: string;
  title: string;
  url?: string;
  type?: string;
  platform?: string;
  duration_minutes?: number;
  is_free?: boolean;
}

export interface TreeNodeData {
  id: string;
  name: string;
  description?: string;
  type: 'root' | 'specialization' | 'ability' | 'skill' | 'knowledge';
  parentId?: string | null;
  level: number;
  originalNodeId?: string; // NEW: Track mapping to template node
  icon?: string; // NEW: Icon from DB
  filled: boolean; // false = placeholder, true = has real data
  metadata?: {
    difficultyLevel?: string;
    estimatedHours?: number;
    keywords?: string[];
  };
  resources?: LearningResource[];
}

export interface TreeState {
  nodes: TreeNodeData[];
  loading: boolean;
  error: string | null;
}

// Initial state - EMPTY (show empty state UI)
const initialState: TreeState = {
  nodes: [],
  loading: false,
  error: null
};

// BehaviorSubject holds current value and emits to new subscribers
export const treeState$ = new BehaviorSubject<TreeState>(initialState);

// Helper functions to update state
export const treeNodeService = {
  /**
   * Set nodes (creates or replaces entire tree)
   * Used for first response or full refresh
   */
  setNodes(nodes: TreeNodeData[]) {
    const filledNodes = nodes.map(n => ({ ...n, filled: true }));
    treeState$.next({
      nodes: filledNodes,
      loading: false,
      error: null
    });
    console.log('🌳 [TreeNode] Set nodes:', filledNodes.length);
  },

  /**
   * Update existing nodes or add new ones
   * Used for subsequent responses to update/add to existing tree
   */
  updateNodes(newNodes: TreeNodeData[]) {
    const current = treeState$.getValue();

    // If empty, just set nodes
    if (current.nodes.length === 0) {
      this.setNodes(newNodes);
      return;
    }

    // Merge: update existing by ID, add new ones
    const nodeMap = new Map(current.nodes.map(n => [n.id, n]));

    newNodes.forEach(newNode => {
      nodeMap.set(newNode.id, { ...newNode, filled: true });
    });

    treeState$.next({
      nodes: Array.from(nodeMap.values()),
      loading: false,
      error: null
    });

    console.log('🌳 [TreeNode] Updated nodes, total:', nodeMap.size);
  },

  /**
   * Set resources for multiple nodes
   * @param resourcesMap Map of nodeId -> resources array
   */
  setResources(resourcesMap: Record<string, LearningResource[]>) {
    const current = treeState$.getValue();
    if (current.nodes.length === 0) return;

    const nodeMap = new Map(current.nodes.map(n => [n.id, n]));
    let updatedCount = 0;

    Object.entries(resourcesMap).forEach(([nodeId, resources]) => {
      if (nodeMap.has(nodeId)) {
        const node = nodeMap.get(nodeId)!;
        nodeMap.set(nodeId, { ...node, resources });
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      treeState$.next({
        ...current,
        nodes: Array.from(nodeMap.values())
      });
      console.log('📚 [TreeNode] Updated resources for nodes:', updatedCount);
    }
  },

  /**
   * Set loading state
   */
  setLoading(loading: boolean) {
    const current = treeState$.getValue();
    treeState$.next({ ...current, loading });
  },

  /**
   * Set error
   */
  setError(error: string) {
    const current = treeState$.getValue();
    treeState$.next({ ...current, error, loading: false });
  },

  /**
   * Clear tree (reset to empty)
   */
  clear() {
    treeState$.next({
      nodes: [],
      loading: false,
      error: null
    });
  },

  /**
   * Get current value (for non-reactive access)
   */
  getCurrentState() {
    return treeState$.getValue();
  },

  /**
   * Update connections for a specific node
   * Used for lazy loading to connect parent to newly loaded children
   */
  updateNodeConnections(nodeId: string, connectionIds: string[]) {
    const current = treeState$.getValue();
    const nodeMap = new Map(current.nodes.map(n => [n.id, n]));

    if (nodeMap.has(nodeId)) {
      const node = nodeMap.get(nodeId)!;
      const existingConnections = (node as any).connections || [];
      // Merge: add new connections without duplicates
      const mergedConnections = [...new Set([...existingConnections, ...connectionIds])];
      nodeMap.set(nodeId, { ...node, connections: mergedConnections } as any);

      treeState$.next({
        ...current,
        nodes: Array.from(nodeMap.values())
      });
      console.log(`🔗 [TreeNode] Updated connections for ${nodeId}:`, mergedConnections.length);
    }
  }
};
