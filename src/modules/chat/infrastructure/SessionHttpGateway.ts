import { SessionGateway } from '../domain/ports/SessionGateway';
import { ChatSession } from '../ui/components/ChatSessionList';
import { Message } from '../domain/entities/Message';
import { httpClient } from '@/shared/infrastructure/HttpClient';
import { apiConfig } from '@/shared/config/api.config';

/**
 * HTTP API adapter for Session operations
 * Uses shared HttpClient and apiConfig for API calls
 */
export class SessionHttpGateway implements SessionGateway {
  
  async getSessions(limit: number, offset: number): Promise<ChatSession[]> {
    try {
      return await httpClient.get<ChatSession[]>(
        apiConfig.endpoints.chat.sessions, 
        { limit, offset }
      );
    } catch (err: any) {
      if (err.message === 'Not authenticated') {
        console.warn('Not authenticated - skipping session load');
        return [];
      }
      throw err;
    }
  }

  async getSessionMessages(sessionId: string): Promise<Message[]> {
    const data = await httpClient.get<any[]>(
      apiConfig.endpoints.chat.sessionMessages(sessionId)
    );
    
    // Convert API response to Message format
    return data.map((m) => ({
      id: m.id,
      role: m.role === 'user' ? 'user' : 'bot',
      text: m.content,
      timestamp: m.created_at
    }));
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      await httpClient.delete(
        apiConfig.endpoints.chat.sessionDelete(sessionId)
      );
      return true;
    } catch {
      return false;
    }
  }
}
