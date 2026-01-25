export type Role = 'user' | 'bot' | 'system';

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp?: string;
  attachments?: Array<{
    file_uri: string;
    filename: string;
    mime_type: string;
  }>;
}

export type ConnectionStatus = 'connecting' | 'idle' | 'thinking' | 'error';
