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
    console.log(`🔌 [WS] Initializing WebSocket to: ${this.wsUrl}`);
    this.ws = new WebSocket(this.wsUrl);

    this.ws.onopen = () => {
      onStatusChange('idle');
      console.log('✅ [WS] Connected!');
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

            // Dispatch event for UI rapid navigation
            window.dispatchEvent(new CustomEvent('session-created', {
              detail: {
                sessionId: data.session_id
              }
            }));
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
          case 'tree_task_started':
            // Backend auto-triggered Celery task with request_id + session_id
            console.log(`🌳 [WS] tree_task_started: ${data.request_id}`);
            treeNodeService.setLoading(true);

            // Send system message with session_id so useChat can navigate
            onMessage({
              id: crypto.randomUUID(),
              role: 'system',
              text: `Bắt đầu session: ${data.session_id}`,
              timestamp: new Date().toISOString()
            });

            // Also dispatch event for Chat component to start polling
            window.dispatchEvent(new CustomEvent('tree-task-started', {
              detail: {
                sessionId: data.session_id,
                requestId: data.request_id,
                message: data.message,
                user_message: data.user_message
              }
            }));
            break;

          // 🔥 NEW: Async Celery worker events
          case 'rendering_progress':
            // Progress update from Celery worker (10%, 40%, 70%)
            console.log(`📊 [WS] Rendering progress: ${data.progress}%`);
            treeNodeService.setLoading(true);

            // Show progress message
            onMessage({
              id: crypto.randomUUID(),
              role: 'system',
              text: `⏳ Đang xử lý... ${data.progress}% (${data.step || ''})`,
              timestamp: new Date().toISOString()
            });
            break;

          case 'tree_ready':
            // Tree completed from Celery worker (100%)
            console.log(`✅ [WS] Tree ready with ${data.tree?.nodes?.length || 0} nodes`);

            if (data.tree && data.tree.nodes) {
              treeNodeService.setNodes(data.tree.nodes as TreeNodeData[]);

              onMessage({
                id: crypto.randomUUID(),
                role: 'system',
                text: `✅ Skill tree đã sẵn sàng! (${data.tree.nodes.length} nodes)`,
                timestamp: new Date().toISOString()
              });
            }

            treeNodeService.setLoading(false);
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
            treeNodeService.setError(data.message || 'Lỗi từ máy chủ');
            break;
        }
      } catch (e) {
        onError('Lỗi xử lý dữ liệu từ máy chủ');
      }
    };

    this.ws.onerror = (event) => {
      console.error('❌ [WS] Error event:', event);
      console.error('❌ [WS] URL was:', this.wsUrl);
      onStatusChange('error');
      onError('Không kết nối được tới máy chủ');
      treeNodeService.setError('Không kết nối được tới máy chủ');
    };

    this.ws.onclose = (event) => {
      console.warn('⚠️ [WS] Disconnected');
      console.warn('⚠️ [WS] Close code:', event.code);
      console.warn('⚠️ [WS] Close reason:', event.reason);
      console.warn('⚠️ [WS] Was clean:', event.wasClean);
      console.warn('⚠️ [WS] URL was:', this.wsUrl);
      onStatusChange('error');
      treeNodeService.setLoading(false);
    };
  }

  sendMessage(text: string, sessionId: string | null, attachments: any[] = []): void {
    if (!this.ws) {
      console.error('❌ [WS] WebSocket not initialized');
      return;
    }

    // If not open yet, wait up to 2 seconds
    if (this.ws.readyState !== WebSocket.OPEN) {
      console.warn(`⏳ [WS] Not ready (state: ${this.ws.readyState}). Retrying...`);

      let retries = 20; // 20 * 100ms = 2s
      const retry = () => {
        if (!this.ws) return;

        if (this.ws.readyState === WebSocket.OPEN) {
          console.log('✅ [WS] Now ready after retry, sending...');
          this._sendNow(text, sessionId, attachments);
        } else if (retries > 0) {
          retries--;
          setTimeout(retry, 100);
        } else {
          console.error('❌ [WS] Timeout waiting for connection');
        }
      };

      setTimeout(retry, 100);
      return;
    }

    this._sendNow(text, sessionId, attachments);
  }

  private _sendNow(text: string, sessionId: string | null, attachments: any[] = []): void {
    try {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        console.error('❌ [WS] Cannot send - WebSocket not open');
        return;
      }

      const token = localStorage.getItem('token');
      this.ws.send(JSON.stringify({
        type: 'user_message',
        text,
        session_id: sessionId,
        token: token,
        attachments: attachments
      }));
      console.log('✅ [WS] Message sent:', text.substring(0, 50));
    } catch (err) {
      console.error('❌ [WS] Send failed:', err);
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
