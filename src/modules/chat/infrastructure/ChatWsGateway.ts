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
            treeNodeService.setLoading(true); // Start loading when session starts processing
            onMessage({
              id: crypto.randomUUID(),
              role: 'system',
              text: `Bắt đầu session: ${data.session_id}`,
              timestamp: new Date().toISOString()
            });
            break;
          case 'status':
            onStatusChange(data.status as ConnectionStatus);
            
            // Handle loading state based on status
            if (data.status === 'thinking') {
                treeNodeService.setLoading(true);
            } else if (data.status === 'idle') {
               // Only turn off if not waiting for Tree Stream (HTTP)
               const isTreeStreaming = (window as any).__treeStreamingActive;
               if (!isTreeStreaming) {
                 treeNodeService.setLoading(false);
               }
            }
            break;
          case 'bot_message':
            // Check if bot message contains tree data
            let isTreeData = false;
            try {
              const possibleTreeData = JSON.parse(data.text);
              if (possibleTreeData.status === 'done' && Array.isArray(possibleTreeData.nodes) && possibleTreeData.nodes.length > 0) {
                isTreeData = true;
                console.log(`🌳 [WS] Tree data received (${possibleTreeData.nodes.length} nodes)`);
                
                // Update tree nodes - this will also reset loading
                treeNodeService.setNodes(possibleTreeData.nodes as TreeNodeData[]);
                
                // Add a user-friendly message instead of JSON
                onMessage({
                  id: crypto.randomUUID(),
                  role: 'bot',
                  text: `✅ ${possibleTreeData.message || 'Đã tạo skill tree thành công!'} (${possibleTreeData.nodes.length} nodes)`,
                  timestamp: new Date().toISOString()
                });
              } else if (possibleTreeData.status === 'error') {
                // Error response, reset loading
                treeNodeService.setLoading(false);
              }
            } catch (e) {
              // Not JSON - this is a normal text chat message
              // Do nothing with tree loading - waiting for explicit tree events
            }
            
            // Only add normal text messages to chat (skip tree JSON)
            if (!isTreeData) {
              onMessage({
                id: crypto.randomUUID(),
                role: 'bot',
                text: data.text,
                timestamp: new Date().toISOString()
              });
            }
            break;
          case 'tree_loading':
            treeNodeService.setLoading(true);
            break;
          case 'tree_generating':
            // SET FLAG IMMEDIATELY to block tree_nodes from socket
            (window as any).__treeStreamingActive = true;
            
            // Backend thông báo sẽ generate tree -> Frontend dùng HTTP streaming thay vì socket
            console.log(`🌳 [WS] tree_generating received, setting streaming flag and triggering HTTP...`);
            treeNodeService.setLoading(true);
            
            // Clear any existing nodes to prevent duplicates
            treeNodeService.clear();
            
            // Dispatch event để SkillTree component gọi HTTP streaming
            window.dispatchEvent(new CustomEvent('trigger-tree-stream', { 
              detail: { 
                sessionId: data.session_id, 
                message: data.message 
              }
            }));
            break;
          case 'tree_nodes':
            // IGNORE socket tree_nodes nếu đang dùng HTTP streaming
            // Chỉ dùng làm fallback nếu HTTP streaming fail
            console.log(`🌳 [WS] tree_nodes received (may be ignored if HTTP streaming active)`);
            if (data.nodes && Array.isArray(data.nodes)) {
              // Check if HTTP streaming is not active
              const isStreaming = (window as any).__treeStreamingActive;
              if (!isStreaming) {
                treeNodeService.setNodes(data.nodes as TreeNodeData[]);
                console.log(`🌳 [WS] Tree replaced with ${data.nodes.length} generated nodes (fallback)`);
              } else {
                console.log(`🌳 [WS] Ignoring socket tree_nodes - HTTP streaming is active`);
              }
            }
            break;
          case 'tree_resources':
            // Update nodes with learning resources
            if (data.resources && typeof data.resources === 'object') {
              treeNodeService.setResources(data.resources as any);
            }
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

  sendMessage(text: string, sessionId: string | null, attachments: any[] = []): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      
      const token = localStorage.getItem('token');
      this.ws.send(JSON.stringify({
        type: 'user_message',
        text,
        session_id: sessionId,
        token: token,
        attachments: attachments
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
