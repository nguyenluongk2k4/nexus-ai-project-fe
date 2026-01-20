export interface SkillTreeGateway {
  getNodeResources(nodeId: string): Promise<any[]>;
  updateResourceStatus(resourceId: string, status: 'not_started' | 'in_progress' | 'completed'): Promise<any>;
  getTreeBySession(sessionId: string): Promise<any>;
  getNodeChildren(nodeId: string): Promise<{ nodes: any[], edges: any[] }>;
  getNodeAlternatives(nodeId: string, level: number, sessionId?: string): Promise<any[]>;
  swapNode(sessionId: string, originalNodeId: string, newNode: any): Promise<{ status: string, nodes: any[] } | null>;
  generateTreeStream(message: string, sessionId: string, onData: (data: any) => void): Promise<void>;
}
