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

  // File Upload State
  const [attachments, setAttachments] = useState<import('../../domain/entities/UploadResponse').UploadResponse[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = useCallback(async (file: File) => {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      const msg = 'File quá lớn (Max 5MB)';
      setError(msg);
      throw new Error(msg);
    }

    setIsUploading(true);
    try {
      const { uploadGateway } = await import('../../infrastructure/UploadHttpGateway');
      const response = await uploadGateway.upload(file);
      setAttachments(prev => [...prev, response]);
      return response;
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError('Upload failed: ' + err.message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const send = useCallback(async (text: string) => {
    try {
      let finalText = text;
      let finalAttachments = [...attachments];

      // Auto-convert long text to file
      const CHAR_LIMIT = 800;
      if (text.length > CHAR_LIMIT) {
        try {
          // Create file from text
          const blob = new Blob([text], { type: 'text/plain' });
          const file = new File([blob], "long-message.txt", { type: "text/plain" });

          // Upload
          // Note: uploadFile triggers state update, but we need the response now
          // We reuse the logic but avoiding double state update issues isn't critical here
          // since we clear attachments right after.
          const autoFile = await uploadFile(file);

          finalAttachments.push(autoFile);
          finalText = `(Nội dung quá dài (${text.length} ký tự), hệ thống đã tự động chuyển thành file đính kèm)`;
        } catch (uploadErr) {
          console.error("Auto-upload failed", uploadErr);
          // Fallback: send as text if upload fails, or throw error?
          // Throwing might be safer to avoid clogging socket
          setError('Gửi thất bại: Nội dung quá dài và không thể tự động tạo file.');
          return;
        }
      }

      // Validation
      if (!finalText.trim() && finalAttachments.length === 0) {
        return;
      }
      if (finalAttachments.length > 0 && !finalText.trim()) {
        setError('Vui lòng thêm mô tả cho file đính kèm');
        return;
      }

      // Optimistic update
      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        text: finalText,
        attachments: finalAttachments, // Include attachments in UI
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, userMsg]);

      // Clear attachments after sending
      setAttachments([]);

      await sendMessageUseCase.execute(finalText, currentSessionId, finalAttachments);
    } catch (err: any) {
      setError(err.message);
    }
  }, [currentSessionId, attachments, uploadFile]);

  const clearError = () => {
    setError(null);
    if (status === 'error') {
      setStatus('idle');
    }
  };

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
    selectSession: loadSessionMessages,
    // Upload
    uploadFile,
    attachments,
    isUploading,
    removeAttachment
  };
}
