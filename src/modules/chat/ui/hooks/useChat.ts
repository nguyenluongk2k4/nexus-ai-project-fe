import { useState, useEffect, useCallback } from 'react';
import { Message, ConnectionStatus } from '../../domain/entities/Message';
import { sendMessageUseCase, getChatService } from '../../providers';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const service = getChatService();
    service.connect(
      (msg) => {
        if (msg.role === 'system' && msg.text.startsWith('Bắt đầu session: ')) {
           setSessionId(msg.text.replace('Bắt đầu session: ', ''));
        }
        setMessages((prev) => [...prev, msg]);
      },
      (newStatus) => setStatus(newStatus),
      (err) => setError(err)
    );

    return () => service.disconnect();
  }, []);

  const send = useCallback(async (text: string) => {
    try {
      // Optimistic update
      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        text,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, userMsg]);
      
      await sendMessageUseCase.execute(text, sessionId);
    } catch (err: any) {
      setError(err.message);
    }
  }, [sessionId]);

  const clearError = () => setError(null);

  return {
    messages,
    status,
    error,
    send,
    clearError
  };
}
