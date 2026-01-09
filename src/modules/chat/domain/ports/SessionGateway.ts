import { ChatSession } from '../../ui/components/ChatSessionList';
import { Message } from '../entities/Message';

/**
 * Port for Session-related API operations
 * Following DDD-lite architecture - Domain only knows interface
 */
export interface SessionGateway {
  /**
   * Get list of recent chat sessions with pagination
   */
  getSessions(limit: number, offset: number): Promise<ChatSession[]>;
  
  /**
   * Get all messages for a specific session
   */
  getSessionMessages(sessionId: string): Promise<Message[]>;
  
  /**
   * Delete a session
   */
  deleteSession(sessionId: string): Promise<boolean>;
}
