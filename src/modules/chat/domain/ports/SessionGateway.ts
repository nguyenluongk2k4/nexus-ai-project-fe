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

  /**
   * Load full session state on page enter
   */
  getSession(sessionId: string): Promise<any>;
  
  /**
   * Get session progress for polling during rendering
   */
  getSessionProgress(sessionId: string): Promise<{
    status: 'idle' | 'rendering' | 'error';
    progress: number;
    step: string;
    request_id: string | null;
  }>;
}
