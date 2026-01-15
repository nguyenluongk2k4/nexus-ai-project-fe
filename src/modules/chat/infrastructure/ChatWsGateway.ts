import { ChatGateway } from '../domain/ports/ChatGateway';
import { Message, ConnectionStatus } from '../domain/entities/Message';
import { treeNodeService, TreeNodeData } from '@/modules/skill-tree/domain/services/treeNodeService';

export class ChatWsGateway implements ChatGateway {
  private ws: WebSocket | null = null;
  private wsUrl: string;

  constructor(url: string) {
    this.wsUrl = url;
  }

  connect(
    onMessage: (message: Message) => void,
    onStatusChange: (status: ConnectionStatus) => void,
    onError: (error: string) => void
  ): void {
    this.ws = new WebSocket(this.wsUrl);

    this.ws.onopen = () => {
      onStatusChange('idle');
      // Don't auto-create session - let it happen when user sends first message
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'session_started':
            onMessage({
              id: crypto.randomUUID(),
              role: 'system',
              text: `Bắt đầu session: ${data.session_id}`,
              timestamp: new Date().toISOString()
            });
            break;
          case 'status':
            onStatusChange(data.status as ConnectionStatus);
            break;
          case 'bot_message':
            onMessage({
              id: crypto.randomUUID(),
              role: 'bot',
              text: data.text,
              timestamp: new Date().toISOString()
            });
            break;
          case 'tree_nodes':
            // Replace tree with generated nodes from chat
            if (data.nodes && Array.isArray(data.nodes)) {
              treeNodeService.setNodes(data.nodes as TreeNodeData[]);
              console.log(`🌳 [WS] Tree replaced with ${data.nodes.length} generated nodes`);
            }
            break;
          case 'tree_resources':
            // Update nodes with learning resources
            if (data.resources && typeof data.resources === 'object') {
              treeNodeService.setResources(data.resources as any);
            }
            break;
          case 'tree_loading':
            treeNodeService.setLoading(true);
            break;
          case 'tree_update':
            // Tree was generated/updated - trigger refetch via API
            treeNodeService.setLoading(false);
            // Emit an event that SkillTree can listen to for refetch
            window.dispatchEvent(new CustomEvent('tree-updated', { 
              detail: { sessionId: data.session_id, nodeCount: data.node_count }
            }));
            console.log(`🌳 [WS] Tree updated with ${data.node_count} nodes, triggering refetch...`);
            break;
          case 'error':
            onError(data.message || 'Lỗi từ máy chủ');
            onStatusChange('error');
            break;
        }
      } catch (e) {
        onError('Lỗi xử lý dữ liệu từ máy chủ');
      }
    };

    this.ws.onerror = () => {
      onStatusChange('error');
      onError('Không kết nối được tới máy chủ');
    };

    this.ws.onclose = () => {
      onStatusChange('error');
    };
  }

  sendMessage(text: string, sessionId: string | null): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const token = localStorage.getItem('token');
      this.ws.send(JSON.stringify({
        type: 'user_message',
        text,
        session_id: sessionId,
        token: token
      }));
    }
  }

  startNewSession(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'new_session' }));
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
