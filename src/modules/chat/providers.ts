import { ChatService } from './domain/services/ChatService';
import { ChatWsGateway } from './infrastructure/ChatWsGateway';
import { SessionHttpGateway } from './infrastructure/SessionHttpGateway';
import { SendMessageUseCase } from './usecases/SendMessageUseCase';
import { apiConfig } from '@/shared/config/api.config';

// Gateways (Infrastructure)
const chatGateway = new ChatWsGateway(apiConfig.getWsUrl(apiConfig.endpoints.chat.ws));
const sessionGateway = new SessionHttpGateway();

// Services (Domain)
const chatService = new ChatService(chatGateway);

// UseCases (Application)
export const sendMessageUseCase = new SendMessageUseCase(chatService);

// Expose for hooks
export const getChatService = () => chatService;
export const getSessionGateway = () => sessionGateway;
