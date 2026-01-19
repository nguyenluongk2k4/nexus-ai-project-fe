import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, History, X, Plus, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, ConnectionStatus } from '@/modules/chat/domain/entities/Message';
import { ChatSession } from '@/modules/chat/ui/components/ChatSessionList';

interface ChatTabProps {
  messages: Message[];
  status: ConnectionStatus;
  error: string | null;
  onSend: (text: string) => void;
  onClearError?: () => void;
  sessions: ChatSession[];
  sessionsLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  loadingMore: boolean;
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
}

export function ChatTab({
  messages,
  status,
  error,
  onSend,
  onClearError,
  sessions,
  sessionsLoading,
  hasMore,
  onLoadMore,
  loadingMore,
  currentSessionId,
  onSelectSession,
  onNewChat
}: ChatTabProps) {
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && status !== 'error') {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            status === 'idle' ? 'bg-emerald-500' : 
            status === 'connecting' || status === 'thinking' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
          }`} />
          <span className="text-xs font-medium text-slate-500">
            {status === 'idle' ? 'Sẵn sàng' : 
             status === 'connecting' ? 'Đang kết nối...' : 
             status === 'thinking' ? 'Đang suy nghĩ...' : 'Lỗi kết nối'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-1.5 rounded-lg transition-colors ${
              showHistory ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={onNewChat}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-start justify-between">
          <span>{error}</span>
          <button onClick={onClearError} className="hover:text-red-800">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Session History Panel */}
      {showHistory && (
        <div className="border-b border-slate-200 bg-slate-50 max-h-48 overflow-y-auto">
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">Chưa có lịch sử</p>
          ) : (
            <div className="py-1">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    setShowHistory(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-100 flex items-center gap-2 ${
                    currentSessionId === session.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
                  }`}
                >
                  <MessageSquare className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{session.title || 'Cuộc trò chuyện mới'}</span>
                </button>
              ))}
              {hasMore && (
                <button
                  onClick={onLoadMore}
                  disabled={loadingMore}
                  className="w-full py-2 text-xs text-indigo-600 hover:bg-indigo-50 flex items-center justify-center gap-1"
                >
                  {loadingMore ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronDown className="w-3 h-3" />}
                  Tải thêm
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <MessageSquare className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">Bắt đầu hỏi về skill tree</p>
            <p className="text-xs mt-2 text-slate-300">Gõ @ để chọn chủ đề nhanh</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="text-sm">{msg.text}</p>
                ) : (
                  <div className="text-sm prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200">
        <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi về kỹ năng..."
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
            disabled={status === 'error' || status === 'thinking'}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || status === 'error' || status === 'thinking'}
            className="p-1.5 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
