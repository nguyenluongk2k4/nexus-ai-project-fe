import { ChatService } from './domain/services/ChatService';
import { ChatWsGateway } from './infrastructure/ChatWsGateway';
import { SendMessageUseCase } from './usecases/SendMessageUseCase';

const host = window.location.hostname || 'localhost';
const chatGateway = new ChatWsGateway(`ws://${host}:8000/api/chat/ws`);
const chatService = new ChatService(chatGateway);

export const sendMessageUseCase = new SendMessageUseCase(chatService);
export const getChatService = () => chatService; // Expose service if needed for connection management
