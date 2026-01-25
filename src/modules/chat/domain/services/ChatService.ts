import { ChatGateway } from '../ports/ChatGateway';
import { Message, ConnectionStatus } from '../entities/Message';

export class ChatService {
  constructor(private gateway: ChatGateway) {}

  connect(
    onMessage: (message: Message) => void,
    onStatusChange: (status: ConnectionStatus) => void,
    onError: (error: string) => void
  ) {
    this.gateway.connect(onMessage, onStatusChange, onError);
  }

  async validateMessage(text: string): Promise<boolean> {
    return text.trim().length > 0;
  }

  send(text: string, sessionId: string | null, attachments: any[] = []) {
    this.gateway.sendMessage(text, sessionId, attachments);
  }

  disconnect() {
    this.gateway.disconnect();
  }
}
