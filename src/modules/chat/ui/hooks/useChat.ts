import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Message, ConnectionStatus } from '../../domain/entities/Message';
import { sendMessageUseCase, getChatService, getSessionGateway } from '../../providers';
import { ChatSession } from '../components/ChatSessionList';

interface UseChatOptions {
  /** If true, prevents navigation to /chat routes (for embedded chat in SkillTree) */
  disableNavigation?: boolean;
}

export function useChat(options: UseChatOptions = {}) {
  const { disableNavigation = false } = options;
  const navigate = useNavigate();
  const { sessionId: urlSessionId } = useParams<{ sessionId: string }>();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(urlSessionId || null);
  
  // Sessions state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const offsetRef = useRef(0);
  const LIMIT = 10;
  
  // Prevent multiple loads
  const isLoadingRef = useRef(false);

  // Get gateway from providers (DI)
  const sessionGateway = getSessionGateway();

  // Load sessions list - stable function
  const loadSessions = useCallback(async (reset: boolean = false) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    
    try {
      const currentOffset = reset ? 0 : offsetRef.current;
      if (reset) {
        setSessionsLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const data = await sessionGateway.getSessions(LIMIT, currentOffset);
      
      if (reset) {
        setSessions(data);
        offsetRef.current = LIMIT;
      } else {
        setSessions(prev => [...prev, ...data]);
        offsetRef.current += LIMIT;
      }
      
      setHasMore(data.length === LIMIT);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setSessionsLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [sessionGateway]);

  // Load more sessions
  const loadMoreSessions = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadSessions(false);
    }
  }, [loadSessions, loadingMore, hasMore]);

  // Load session messages from API
  const loadSessionMessages = useCallback(async (sessionId: string) => {
    try {
      setMessages([]);
      const loadedMessages = await sessionGateway.getSessionMessages(sessionId);
      setMessages(loadedMessages);
      setCurrentSessionId(sessionId);
    } catch (err: any) {
      console.error('Failed to load messages:', err);
      if (err.message === 'Not authenticated') {
        setError('Bạn cần đăng nhập để xem tin nhắn');
      } else {
        setError('Không thể tải tin nhắn');
      }
    }
  }, [sessionGateway]);

  // Start new chat
  const startNewChat = useCallback(() => {
    setMessages([]);
    setCurrentSessionId(null);
    setCurrentSessionId(null);
    if (!disableNavigation) {
      navigate('/chat');
    }
  }, [navigate, disableNavigation]);

  // Initial load - only once
  useEffect(() => {
    loadSessions(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load messages when URL changes
  useEffect(() => {
    if (urlSessionId) {
      loadSessionMessages(urlSessionId);
      setCurrentSessionId(urlSessionId);
    } else {
      // Only clear if actually at /chat (new chat)
      setMessages([]);
      setCurrentSessionId(null);
    }
  }, [urlSessionId, loadSessionMessages]);

  // WebSocket connection - separate effect
  useEffect(() => {
    const service = getChatService();
    
    const handleMessage = (msg: Message) => {
      // Handle new session creation - navigate but don't add to messages
      if (msg.role === 'system' && msg.text.startsWith('Bắt đầu session: ')) {
        const newSessionId = msg.text.replace('Bắt đầu session: ', '');
        setCurrentSessionId(newSessionId);
        // Navigate to the new session URL only if navigation is enabled
        if (!disableNavigation) {
          navigate(`/chat/c/${newSessionId}`, { replace: true });
        }
        // Reload sessions after a brief delay to show new one
        setTimeout(() => loadSessions(true), 500);
        return; // Don't add system message to chat
      }
      
      // Only add bot messages to the list
      if (msg.role === 'bot') {
        setMessages((prev) => [...prev, msg]);
      }
    };
    
    service.connect(
      handleMessage,
      (newStatus) => setStatus(newStatus),
      (err) => setError(err)
    );

    return () => service.disconnect();
  }, [navigate, loadSessions]);

  // Restore tree context when session changes
  useEffect(() => {
    if (currentSessionId && sessions.length > 0) {
      const session = sessions.find(s => s.id === currentSessionId);
      if (session?.context_data?.tree_nodes) {
        import('../../../skill-tree/domain/services/treeNodeService').then(({ treeNodeService }) => {
           // Small delay to ensure UI is ready
           setTimeout(() => {
             treeNodeService.updateNodes(session.context_data!.tree_nodes as any);
             console.log('🌳 [useChat] Restored tree from session context');
           }, 100);
        });
      }
    }
  }, [currentSessionId, sessions]);

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
      
      await sendMessageUseCase.execute(text, currentSessionId);
    } catch (err: any) {
      setError(err.message);
    }
  }, [currentSessionId]);

  const clearError = () => setError(null);

  return {
    messages,
    status,
    error,
    send,
    clearError,
    // Session management
    sessions,
    sessionsLoading,
    hasMore,
    loadMoreSessions,
    loadingMore,
    currentSessionId,
    startNewChat,
    selectSession: loadSessionMessages
  };
}
