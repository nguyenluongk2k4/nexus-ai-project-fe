export interface SkillTreeGateway {
  getNodeResources(nodeId: string): Promise<any[]>;
  updateResourceStatus(resourceId: string, status: 'not_started' | 'in_progress' | 'completed'): Promise<any>;
  getTreeBySession(sessionId: string): Promise<any>;
}
