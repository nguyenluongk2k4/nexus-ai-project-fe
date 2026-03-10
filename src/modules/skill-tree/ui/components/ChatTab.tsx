import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, History, X, Plus, ChevronDown, Paperclip, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, ConnectionStatus } from '@/modules/chat/domain/entities/Message';
import { ChatSession } from '@/modules/chat/ui/components/ChatSessionList';
import { UploadResponse } from '@/modules/chat/domain/entities/UploadResponse';

interface ChatTabProps {
  messages: Message[];
  status: ConnectionStatus;
  sessionStatus?: 'idle' | 'rendering' | 'error';
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

  // Upload Props
  uploadFile?: (file: File) => Promise<UploadResponse>;
  attachments?: UploadResponse[];
  isUploading?: boolean;
  removeAttachment?: (index: number) => void;
}

export function ChatTab({
  messages,
  status,
  sessionStatus,
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
  onNewChat,
  uploadFile,
  attachments = [],
  isUploading = false,
  removeAttachment
}: ChatTabProps) {
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && uploadFile) {
      const file = e.target.files[0];
      try {
        await uploadFile(file);
      } catch (err) {
        // Error handling is done in useChat
      } finally {
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && (status !== 'error' || input.trim().toLowerCase() === '/sancode')) {
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
          <div className={`w-2 h-2 rounded-full ${status === 'idle' ? 'bg-emerald-500' :
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
            className={`p-1.5 rounded-lg transition-colors ${showHistory ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100 text-slate-500'
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
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-100 flex items-center gap-2 ${currentSessionId === session.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
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
                className={`max-w-[85%] rounded-2xl px-4 py-2 ${msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-800'
                  }`}
              >
                {/* Message Attachments */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className={`flex flex-wrap gap-2 mb-2 ${msg.role === 'user' ? 'text-white' : 'text-slate-800'}`}>
                    {msg.attachments.map((att, idx) => (
                      <a
                        key={idx}
                        href={att.file_uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-colors ${msg.role === 'user'
                          ? 'bg-white/20 hover:bg-white/30'
                          : 'bg-white border border-slate-200 hover:bg-slate-50'
                          }`}
                        title={att.filename}
                      >
                        {att.mime_type.startsWith('image/') ? (
                          <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0 bg-black/10">
                            <img src={att.file_uri} alt={att.filename} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <FileText className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span className="truncate max-w-[120px]">{att.filename}</span>
                      </a>
                    ))}
                  </div>
                )}

                {msg.role === 'user' ? (
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
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

        {/* Typing indicator... */}
        {(sessionStatus === 'rendering' || status === 'thinking') && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-slate-100 text-slate-500">
              <div className="flex space-x-1 items-center h-4">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input - matched height and structure with SkillTree bottom bar */}
      <div className="h-[64px] border-t border-slate-200 bg-white flex flex-col justify-center flex-shrink-0">
        <div className="px-4">
          {/* Attachment Tokens */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="group relative flex items-center gap-3 bg-white border border-slate-200 shadow-sm rounded-xl p-3 min-w-[200px] max-w-[240px] animate-in fade-in zoom-in duration-200 hover:shadow-md transition-shadow"
                >
                  {file.mime_type.startsWith('image/') ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                      <img src={file.file_uri} alt={file.display_name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-semibold text-slate-800 truncate" title={file.filename}>
                      {file.display_name || file.filename}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {file.token_count > 0 ? `${file.token_count.toLocaleString()} tokens` : `${(file.size_bytes / 1024).toFixed(1)} KB`}
                    </span>
                  </div>

                  <button
                    onClick={() => removeAttachment && removeAttachment(index)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-white text-slate-400 border border-slate-200 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
            {/* Upload Button */}
            {uploadFile && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || status === 'error'}
                className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${isUploading
                  ? 'bg-slate-200 text-slate-400 cursor-wait'
                  : 'hover:bg-slate-200 text-slate-500 hover:text-slate-700'
                  }`}
                title="Upload file"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
              </button>
            )}
            <input
              id="tour-master-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi về kỹ năng..."
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
              disabled={(status === 'error' || status === 'thinking') && input.trim().toLowerCase() !== '/sancode'}
            />
            <button
              onClick={handleSend}
              disabled={(!input.trim() || ((status === 'error' || status === 'thinking') && input.trim().toLowerCase() !== '/sancode'))}
              className="p-1.5 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
