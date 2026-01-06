import { useState, useEffect, useCallback, useMemo } from 'react';
import { Message, ConnectionStatus } from '@/domain/entities/Message';
import { ChatWsGateway } from '@/modules/chat/infrastructure/ChatWsGateway';
import { ChatService } from '@/domain/services/ChatService';
import { SendMessageUseCase } from '@/modules/chat/usecases/SendMessageUseCase';

// DI Manual setup (có thể tách ra app/providers.ts sau nếu phức tạp hơn)
const host = window.location.hostname || 'localhost';
const gateway = new ChatWsGateway(`ws://${host}:8000/ws`);
const service = new ChatService(gateway);
const sendMessageUseCase = new SendMessageUseCase(service);

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
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
