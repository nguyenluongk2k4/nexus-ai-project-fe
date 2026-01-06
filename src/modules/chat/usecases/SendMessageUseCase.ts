import { ChatService } from '../domain/services/ChatService';

export class SendMessageUseCase {
  constructor(private chatService: ChatService) {}

  async execute(text: string, sessionId: string | null): Promise<void> {
    const isValid = await this.chatService.validateMessage(text);
    if (!isValid) {
      throw new Error('Tin nhắn không hợp lệ');
    }
    this.chatService.send(text, sessionId);
  }
}
