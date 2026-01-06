export type Role = 'user' | 'bot' | 'system';

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp?: string;
}

export type ConnectionStatus = 'connecting' | 'idle' | 'thinking' | 'error';
