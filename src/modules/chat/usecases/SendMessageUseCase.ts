import { ChatService } from '../domain/services/ChatService';

export class SendMessageUseCase {
  constructor(private chatService: ChatService) {}

  async execute(text: string, sessionId: string | null, attachments: any[] = []): Promise<void> {
    const isValid = await this.chatService.validateMessage(text);
    if (!isValid && attachments.length === 0) { // Allow empty text if file attached
       // throw new Error('Tin nhắn không hợp lệ');
    }
    this.chatService.send(text, sessionId, attachments);
  }
}
