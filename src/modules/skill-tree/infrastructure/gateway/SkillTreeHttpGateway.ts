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

  async getNodeChildren(nodeId: string, sessionId?: string): Promise<{ nodes: any[], edges: any[] }> {
    try {
      return await httpClient.get<{ nodes: any[], edges: any[] }>(apiConfig.endpoints.skillTree.nodeChildren(nodeId, sessionId));
    } catch (e) {
      return { nodes: [], edges: [] };
    }
  }

  async getNodeAlternatives(nodeId: string, level: number, sessionId?: string, nodeName?: string): Promise<any[]> {
    try {
      const params = new URLSearchParams({
          level: level.toString(),
          ...(sessionId && { session_id: sessionId })
          // Removed node_name - backend queries DB directly using nodeId
      });
      return await httpClient.get<any[]>(`/skill-tree/nodes/${encodeURIComponent(nodeId)}/alternatives?${params}`);
    } catch (e) {
      console.error("Failed to fetch node alternatives", e);
      return [];
    }
  }

  /**
   * Generate tree via HTTP streaming (SSE)
   * @param message - User's learning query message
   * @param sessionId - Current chat session ID
   * @param onStatus - Callback for status updates
   * @param onNodes - Callback when nodes are received
   * @param onError - Callback for errors
   */
  async generateTreeStream(
    message: string,
    sessionId: string,
    onStatus: (status: string, statusMessage: string) => void,
    onNodes: (nodes: any[]) => void,
    onError: (error: string) => void
  ): Promise<void> {
    const token = localStorage.getItem('token');
    const baseUrl = apiConfig.baseUrl;
    
    try {
      const response = await fetch(`${baseUrl}/skill-tree/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message, session_id: sessionId })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Parse SSE events
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep incomplete event in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              console.log('🌳 [Stream] Received:', data);
              
              if (data.status === 'generating') {
                onStatus('generating', data.message || 'Đang tạo cây kỹ năng...');
              } else if (data.status === 'done') {
                if (data.nodes && data.nodes.length > 0) {
                  onNodes(data.nodes);
                }
                onStatus('done', data.message || 'Hoàn thành');
              } else if (data.status === 'error') {
                onError(data.message || 'Lỗi tạo cây');
              }
            } catch (parseErr) {
              console.error('Failed to parse SSE data:', parseErr);
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to generate tree stream", e);
      onError(e instanceof Error ? e.message : 'Lỗi kết nối');
    }
  }

  async swapNode(sessionId: string, originalNodeId: string, newNode: any): Promise<any[]> {
    try {
      const response = await httpClient.post<{ status: string, nodes: any[] }>(
        `/skill-tree/session/${sessionId}/swap`,
        { original_node_id: originalNodeId, new_node: newNode }
      );
      return response.nodes;
    } catch (e) {
      console.error("Failed to swap node", e);
      return [];
    }
  }
}
