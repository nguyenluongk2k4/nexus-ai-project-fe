import { SkillTreeGateway } from '../../domain/ports/SkillTreeGateway';
import { httpClient } from '@/shared/infrastructure/HttpClient';

import { apiConfig } from '@/shared/config/api.config';

export class SkillTreeHttpGateway implements SkillTreeGateway {
  async getNodeResources(nodeId: string): Promise<any[]> {
    try {
      const url = apiConfig.endpoints.skillTree.nodeResources(nodeId);
      return await httpClient.get<any[]>(url);
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

  async getNodeChildren(nodeId: string): Promise<{ nodes: any[], edges: any[] }> {
    try {
      return await httpClient.get<{ nodes: any[], edges: any[] }>(apiConfig.endpoints.skillTree.nodeChildren(nodeId));
    } catch (e) {
      console.error("Failed to fetch node children", e);
      return { nodes: [], edges: [] };
    }
  }

  async getNodeAlternatives(nodeId: string, level: number, sessionId?: string): Promise<any[]> {
    try {
      const params = new URLSearchParams({ level: level.toString() });
      if (sessionId) params.append('session_id', sessionId);
      
      const url = `${apiConfig.endpoints.skillTree.nodeAlternatives(nodeId)}?${params}`;
      return await httpClient.get<any[]>(url);
    } catch (e) {
      console.error("Failed to fetch node alternatives", e);
      return [];
    }
  }

  async swapNode(sessionId: string, originalNodeId: string, newNode: any): Promise<{ status: string, nodes: any[] } | null> {
    try {
      const response = await httpClient.post<{ status: string, nodes: any[] }>(
        apiConfig.endpoints.skillTree.swapNode(sessionId),
        { original_node_id: originalNodeId, new_node: newNode }
      );
      return response;
    } catch (e) {
      console.error("Failed to swap node", e);
      return null;
    }
  }

  async generateTreeStream(message: string, sessionId: string, onData: (data: any) => void): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiConfig.getHttpUrl(apiConfig.endpoints.skillTree.generate), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ message, session_id: sessionId })
      });

      if (!response.ok) throw new Error('Generation failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        
        if (value) {
            buffer += decoder.decode(value, { stream: true });
        }
        
        if (done) break;
        
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep incomplete part
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const jsonStr = trimmed.replace('data: ', '');
              const data = JSON.parse(jsonStr);
              onData(data);
            } catch (e) {
              console.error('Error parsing stream data', e);
            }
          }
        }
      }
    } catch (e) {
      console.error("Stream generation error", e);
      throw e;
    }
  }

  // =============== My Skill Tree Methods ===============

  async getMyTree(): Promise<any> {
    try {
      return await httpClient.get<any>(apiConfig.endpoints.skillTree.myTree);
    } catch (e) {
      console.error("Failed to fetch my tree", e);
      return null;
    }
  }

  async saveToMyTree(sessionId: string, nodeIds: string[]): Promise<any> {
    try {
      return await httpClient.post<any>(apiConfig.endpoints.skillTree.saveToMyTree, {
        session_id: sessionId,
        node_ids: nodeIds
      });
    } catch (e) {
      console.error("Failed to save to my tree", e);
      throw e;
    }
  }

  async removeFromMyTree(nodeId: string): Promise<boolean> {
    try {
      await httpClient.delete(apiConfig.endpoints.skillTree.removeFromMyTree(nodeId));
      return true;
    } catch (e) {
      console.error("Failed to remove from my tree", e);
      return false;
    }
  }
}
