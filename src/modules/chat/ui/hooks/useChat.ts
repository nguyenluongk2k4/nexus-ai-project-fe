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

  // Streaming state
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'rendering' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState('');
  const streamingSessionRef = useRef<string | null>(null);
  const isMountedRef = useRef(true); // Track if component is mounted

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

  // Load full session on page enter
  const loadFullSession = useCallback(async (sessionId: string) => {
    try {
      const sessionData = await sessionGateway.getSession(sessionId);

      // Merge messages instead of overwriting (preserve user message from tree_task_started event)
      setMessages(prev => {
        if (prev.length > 0) {
          // Keep existing messages (from tree_task_started event)
          // Add new messages from API that aren't already present
          const existingIds = new Set(prev.map((m: Message) => m.id));
          const newMessages = (sessionData.messages || []).filter(
            (m: any) => !existingIds.has(m.id)
          );
          console.log(`📥 [useChat] Merging ${newMessages.length} new messages with ${prev.length} existing`);
          return [...prev, ...newMessages];
        } else {
          // No existing messages, use API data
          return sessionData.messages || [];
        }
      });

      setCurrentSessionId(sessionId);
      setSessionStatus(sessionData.status);
      setProgress(sessionData.progress || 0);

      console.log(`✅ [useChat] Session loaded - status: ${sessionData.status}, progress: ${sessionData.progress}%`);

      // Option 1: Optimistically add to session list if not present
      setSessions(prev => {
        if (prev.some(s => s.id === sessionData.id)) return prev;

        // Construct minimal session object for list
        const newSession: ChatSession = {
          id: sessionData.id,
          title: sessionData.title || 'New Session',
          created_at: sessionData.created_at || new Date().toISOString(),
          updated_at: sessionData.updated_at || new Date().toISOString(),
          context_data: sessionData.context_data
        };
        return [newSession, ...prev];
      });


      // Fix: Directly update tree nodes from the loaded session data
      if (sessionData.context_data?.tree_nodes) {
        import('../../../skill-tree/domain/services/treeNodeService').then(({ treeNodeService }) => {
          const nodes = sessionData.context_data.tree_nodes;
          console.log(`🌳 [useChat] Found tree nodes in context: ${nodes.length}`);
          if (nodes.length > 0) {
            console.log('🌳 [useChat] First node sample:', nodes[0]);
          }

          // Use setNodes to REPLACE the tree state for this session (avoid mixing with previous session)
          treeNodeService.setNodes(nodes);
          console.log(`🌳 [useChat] Updated tree nodes from loadFullSession via setNodes`);

          // Also stop loading
          if (sessionData.status === 'idle') {
            treeNodeService.setLoading(false);
          }
        });
      }

      // Note: If status is 'rendering', streaming will be auto-triggered 
      // when SkillTree detects sessionStatus === 'rendering'
    } catch (err: any) {
      console.error('Failed to load full session:', err);
      setError('Không thể tải session');
    }
  }, [sessionGateway]);

  // Cleanup streaming on unmount
  const stopStreaming = useCallback(() => {
    if (streamingSessionRef.current) {
      console.log('🛑 [useChat] Stopped streaming');
      streamingSessionRef.current = null;
    }
  }, []);

  // Start new chat
  const startNewChat = useCallback(() => {
    setMessages([]);
    setCurrentSessionId(null);
    setCurrentSessionId(null);
    if (!disableNavigation) {
      navigate('/chat');
    }
  }, [navigate, disableNavigation]);

  // Track loaded session to avoid duplicate API calls (especially from React StrictMode)
  const loadedSessionIdRef = useRef<string | null>(null);

  // Load sessions when component mounts - always load for both /chat and /skilltree
  useEffect(() => {
    // Always load session history (for sidebar on both pages)
    loadSessions(true);
  }, [loadSessions]);

  // Load messages when URL changes
  useEffect(() => {
    if (urlSessionId) {
      // Only load if not already loaded (prevent React StrictMode double-fetch)
      if (loadedSessionIdRef.current !== urlSessionId) {
        loadedSessionIdRef.current = urlSessionId;
        loadFullSession(urlSessionId);
      }
      setCurrentSessionId(urlSessionId);
    } else {
      // Only clear if actually at /chat (new chat)
      setMessages([]);
      setCurrentSessionId(null);
      loadedSessionIdRef.current = null;
      stopStreaming();
    }

    // Cleanup: stop streaming only when urlSessionId actually changes to null/different
    return () => {
      // Only stop if we're leaving the /chat/c/{id} page
      if (!urlSessionId) {
        stopStreaming();
      }
    };
  }, [urlSessionId]);

  // Track previous sessionId to detect new session creation
  const prevSessionIdRef = useRef<string | null>(null);

  // WebSocket connection - init ONCE, never disconnect
  useEffect(() => {
    const service = getChatService();

    const handleMessage = (msg: Message) => {
      // Handle new session creation
      if (msg.role === 'system' && msg.text.startsWith('Bắt đầu session: ')) {
        const newSessionId = msg.text.replace('Bắt đầu session: ', '');
        setCurrentSessionId(newSessionId);
        prevSessionIdRef.current = newSessionId;

        // Navigate to new session (session list loaded on-demand)
        if (!disableNavigation) {
          navigate(`/chat/c/${newSessionId}`, { replace: true });
        }
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

    // Never disconnect - socket stays alive across all navigation
    return () => { }; // No cleanup
  }, [disableNavigation, navigate, loadSessions]); // Include deps to access latest values

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

  // Cleanup streaming on unmount
  useEffect(() => {
    isMountedRef.current = true; // Mark as mounted
    return () => {
      stopStreaming();
      isMountedRef.current = false; // Mark component as unmounted
    };
  }, [stopStreaming]);

  // Listen for tree-task-started event from WebSocket: navigate + load messages + start stream
  useEffect(() => {
    const handleTreeTaskStarted = async (event: CustomEvent<any>) => {
      // Extract session_id and user_message from WS event (message has DB id from backend)
      const sessionId = event.detail?.session_id || event.detail?.sessionId;
      const userMessageData = event.detail?.user_message; // Can be string or {id, text, role}

      if (!sessionId) {
        console.warn('⚠️ [useChat] No session_id in tree-task-started event:', event.detail);
        return;
      }

      console.log(`🌊 [useChat] tree-task-started: session=${sessionId}, message received from backend`);

      try {
        // Step 1: Add user message to state (received from DB via backend)
        if (userMessageData && isMountedRef.current) {
          // Backend MUST send object format: {id, text, role}
          if (typeof userMessageData !== 'object' || !userMessageData.id) {
            console.error('❌ [useChat] Invalid user_message format from backend:', userMessageData);
            return; // Don't display invalid message
          }

          const userMsg: Message = {
            id: userMessageData.id,
            role: 'user',
            text: userMessageData.text,
            attachments: userMessageData.attachments || [],
            timestamp: new Date().toISOString()
          };

          setMessages([userMsg]); // Start with user message from DB
          setCurrentSessionId(sessionId);
          console.log('💬 [useChat] User message added to UI (ID from DB:', userMsg.id, ')');
        }

        // Step 2: Navigate to skill tree page with session ID
        // SkillTree page will auto-detect rendering status and start stream
        navigate(`/skilltree/c/${sessionId}`);
        console.log(`📍 [useChat] Navigated to /skilltree/c/${sessionId}`);

      } catch (err) {
        console.error('❌ [useChat] Error handling tree-task-started:', err);
        if (isMountedRef.current) {
          setError('Lỗi khởi tạo session');
        }
      }
    };

    window.addEventListener('tree-task-started', handleTreeTaskStarted as unknown as EventListener);
    return () => {
      window.removeEventListener('tree-task-started', handleTreeTaskStarted as unknown as EventListener);
    };
  }, [navigate]);

  // Streaming from server endpoint (called after tree_task_started event)
  const startStreamingFromServer = useCallback(async (sessionId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ [useChat] No auth token found');
        if (isMountedRef.current) {
          setSessionStatus('error');
          setProgressStep('Lỗi xác thực');
        }
        return;
      }

      console.log(`📡 [useChat] Starting stream for session: ${sessionId}`);

      // Set initial rendering status
      if (isMountedRef.current) {
        setSessionStatus('rendering');
        setProgress(0);
        setProgressStep('Bắt đầu...');
      }

      // Create abort controller with 180s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.warn('⏱️ [useChat] Stream request timeout after 180s');
      }, 180000);

      const response = await fetch(`/api/chat/session/${sessionId}/progress-stream`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      }).catch(err => {
        clearTimeout(timeoutId);
        console.error('❌ [useChat] Stream fetch error:', err.name, err.message);
        if (isMountedRef.current) {
          setSessionStatus('error');
          setProgressStep('Lỗi kết nối: ' + (err.name === 'AbortError' ? 'Timeout' : err.message || 'Network error'));
        }
        throw err;
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`❌ [useChat] Stream failed: ${response.status} ${response.statusText}`);
        if (isMountedRef.current) {
          setSessionStatus('error');
          setProgressStep(`Lỗi: ${response.status}`);
        }
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = '';

      const readChunk = async (): Promise<void> => {
        // Stop reading if component unmounted
        if (!isMountedRef.current) return;

        try {
          const { done, value } = await reader.read();
          if (done) {
            console.log('✅ [useChat] Stream completed');
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const event = JSON.parse(line.substring(6));
                console.log(`📊 [useChat] Stream event:`, event.type);

                // Only update state if mounted
                if (!isMountedRef.current) return;

                switch (event.type) {
                  case 'progress':
                    setProgress(event.progress || 0);
                    setProgressStep(event.step || '');
                    console.log(
                      `📈 [useChat] Progress: ${event.progress}% - ${event.step}`);
                    break;

                  case 'completed':
                    setProgress(100);
                    setProgressStep('Hoàn thành!');
                    setSessionStatus('idle');
                    console.log('✅ [useChat] Stream: Completed');
                    // Reload session to get tree data (with small delay to avoid overlap)
                    setTimeout(() => {
                      loadedSessionIdRef.current = null; // Allow reload
                      loadFullSession(sessionId);
                    }, 500);
                    break;

                  case 'error':
                    setSessionStatus('error');
                    setProgressStep(event.message || 'Lỗi xử lý');
                    console.error('❌ [useChat] Stream error:', event.message);
                    break;

                  case 'timeout':
                    setSessionStatus('error');
                    setProgressStep('Timeout');
                    console.warn('⏱️ [useChat] Stream timeout');
                    break;
                }
              } catch (parseErr) {
                console.warn('[useChat] Failed to parse stream event:', line);
              }
            }
          }

          // Continue reading
          await readChunk();
        } catch (err) {
          console.error('❌ [useChat] Stream reading error:', err);
          if (isMountedRef.current) {
            setSessionStatus('error');
            setProgressStep('Lỗi kết nối');
          }
        }
      };

      // Start reading
      await readChunk();
    } catch (err) {
      console.error('❌ [useChat] Stream error:', err);
      if (isMountedRef.current) {
        setSessionStatus('error');
        setProgressStep('Lỗi');
      }
    }
  }, [loadFullSession]);
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
    // Polling & Progress
    sessionStatus,
    progress,
    progressStep,
    startStreaming: startStreamingFromServer,
    // Upload
    uploadFile,
    attachments,
    isUploading,
    removeAttachment
  };
}
