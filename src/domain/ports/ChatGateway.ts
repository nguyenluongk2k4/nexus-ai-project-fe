import { Message, ConnectionStatus } from '../entities/Message';

export interface ChatGateway {
  connect(onMessage: (message: Message) => void, onStatusChange: (status: ConnectionStatus) => void, onError: (error: string) => void): void;
  sendMessage(text: string, sessionId: string | null): void;
  startNewSession(): void;
  disconnect(): void;
}
