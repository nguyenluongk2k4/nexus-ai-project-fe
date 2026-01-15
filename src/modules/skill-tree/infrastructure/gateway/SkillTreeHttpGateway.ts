import { SkillTreeGateway } from '../../domain/ports/SkillTreeGateway';
import { httpClient } from '@/shared/infrastructure/HttpClient';

import { apiConfig } from '@/shared/config/api.config';

export class SkillTreeHttpGateway implements SkillTreeGateway {
  async getNodeResources(nodeId: string): Promise<any[]> {
    try {
      return await httpClient.get<any[]>(apiConfig.endpoints.skillTree.nodeResources(nodeId));
    } catch (e) {
      console.error("Failed to fetch resources", e);
      return [];
    }
  }

  async updateResourceStatus(resourceId: string, status: 'not_started' | 'in_progress' | 'completed'): Promise<any> {
    try {
      return await httpClient.patch<any>(apiConfig.endpoints.skillTree.resourceProgress(resourceId), { status });
    } catch (e) {
      console.error("Failed to update resource status", e);
      throw e;
    }
  }

  async getTreeBySession(sessionId: string): Promise<any> {
    try {
      return await httpClient.get<any>(apiConfig.endpoints.skillTree.treeBySession(sessionId));
    } catch (e) {
      console.error("Failed to fetch tree", e);
      return null;
    }
  }
}
