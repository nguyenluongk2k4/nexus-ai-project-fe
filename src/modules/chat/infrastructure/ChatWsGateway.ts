import { ChatGateway } from '@/domain/ports/ChatGateway';
import { Message, ConnectionStatus } from '@/domain/entities/Message';

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
      this.startNewSession();
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
            // Emit a special event or just handle it as a system message
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
      this.ws.send(JSON.stringify({
        type: 'user_message',
        text,
        session_id: sessionId
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
