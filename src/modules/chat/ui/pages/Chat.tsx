import { useRef, useState, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Copy, Check, History } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat } from '../hooks/useChat';
import { ChatHistoryDialog } from '../components/ChatSessionList';
import { CHAT_SUGGESTIONS, CHAT_CONFIG } from '@/modules/chat/domain/constants';

export function Chat() {
  const {
    messages,
    status,
    error,
    send,
    sessions,
    sessionsLoading,
    hasMore,
    loadMoreSessions,
    loadingMore
  } = useChat();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, status]);

  const handleSend = () => {
    if (!input.trim()) return;
    send(input);
    setInput('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-gray-50">
      {/* History Dialog */}
      <ChatHistoryDialog
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        sessions={sessions}
        loading={sessionsLoading}
        hasMore={hasMore}
        onLoadMore={loadMoreSessions}
        loadingMore={loadingMore}
      />

      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-teal-500 text-white shadow-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{CHAT_CONFIG.TITLE}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className={`inline-block w-2 h-2 rounded-full ${status === 'idle' ? 'bg-green-500' : status === 'thinking' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></span>
                <span>
                  {status === 'connecting' && 'Đang kết nối...'}
                  {status === 'idle' && 'Sẵn sàng trả lời'}
                  {status === 'thinking' && 'Đang phân tích câu hỏi...'}
                  {status === 'error' && 'Lỗi kết nối'}
                </span>
              </div>
            </div>
          </div>

          {/* History Button */}
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <History className="w-4 h-4" />
            <span>Lịch sử</span>
          </button>
        </div>
      </div>

      {/* Messages - Scrollable, same bg */}
      <div ref={listRef} className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-violet-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{CHAT_CONFIG.WELCOME_NEW}</h3>
                <p className="text-gray-500 mb-6">
                  {CHAT_CONFIG.WELCOME_DESCRIPTION}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {CHAT_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="px-4 py-2 bg-white hover:bg-violet-50 text-violet-700 rounded-lg text-sm transition-colors border border-violet-200 shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              {m.role === 'user' && (
                <div className="flex items-start gap-3 max-w-[75%]">
                  <div className="flex-1 rounded-2xl rounded-tr-sm px-4 py-3 bg-gradient-to-r from-violet-600 to-teal-600 text-white shadow-md">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    U
                  </div>
                </div>
              )}
              {m.role === 'system' && (
                <div className="w-full flex justify-center">
                  <div className="px-4 py-2 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200">
                    {m.text}
                  </div>
                </div>
              )}
              {m.role === 'bot' && (
                <div className="flex items-start gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-violet-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    AI
                  </div>
                  <div className="flex-1 relative group">
                    {/* Copy button */}
                    <button
                      className="absolute -top-2 -right-2 p-2 bg-white rounded-lg shadow-md border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 z-10"
                      onClick={async () => {
                        await navigator.clipboard.writeText(m.text);
                        setCopiedId(m.id);
                        setTimeout(() => setCopiedId(null), 1500);
                      }}
                      title="Copy"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>

                    {/* Markdown content - no box */}
                    <div className="prose prose-sm max-w-none select-text text-gray-700">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ node, ...props }) => (
                            <a {...props} className="text-violet-600 hover:text-violet-700 underline font-medium" target="_blank" rel="noreferrer" />
                          ),
                          p: ({ node, ...props }) => <p {...props} className="mb-3 last:mb-0 leading-relaxed" />,
                          ul: ({ node, ...props }) => <ul {...props} className="my-3 space-y-1 list-disc pl-5" />,
                          ol: ({ node, ...props }) => <ol {...props} className="my-3 space-y-1 list-decimal pl-5" />,
                          li: ({ node, ...props }) => <li {...props} className="leading-relaxed" />,
                          h1: ({ node, ...props }) => <h1 {...props} className="text-xl font-bold text-gray-900 mt-4 mb-2 first:mt-0" />,
                          h2: ({ node, ...props }) => <h2 {...props} className="text-lg font-bold text-gray-900 mt-4 mb-2 first:mt-0" />,
                          h3: ({ node, ...props }) => <h3 {...props} className="text-base font-semibold text-gray-900 mt-3 mb-2 first:mt-0" />,
                          strong: ({ node, ...props }) => <strong {...props} className="font-semibold text-gray-900" />,
                          blockquote: ({ node, ...props }) => <blockquote {...props} className="border-l-4 border-violet-400 pl-4 py-2 my-3 bg-violet-50 rounded-r" />,
                          pre: ({ node, ...props }) => (
                            <pre {...props} className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-xs my-3 shadow-inner" />
                          ),
                          code({ node, className, children, ...props }) {
                            const content = String(children);
                            const isInline = !className || !className.includes('language-');

                            if (isInline) {
                              return (
                                <code {...props} className="bg-violet-100 text-violet-800 rounded px-1.5 py-0.5 font-mono text-xs">
                                  {content}
                                </code>
                              );
                            }
                            return (
                              <code className={className} {...props}>
                                {content}
                              </code>
                            );
                          },
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto my-3">
                              <table {...props} className="min-w-full divide-y divide-gray-200 border rounded-lg overflow-hidden" />
                            </div>
                          ),
                          th: ({ node, ...props }) => <th {...props} className="px-3 py-2 bg-gray-100 text-left text-xs font-semibold text-gray-700" />,
                          td: ({ node, ...props }) => <td {...props} className="px-3 py-2 text-sm border-t" />,
                        }}
                      >
                        {m.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {status === 'thinking' && (
            <div className="flex items-start gap-3 animate-in fade-in duration-300">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-violet-600 flex items-center justify-center text-white font-semibold text-sm">
                AI
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                <span className="text-sm">Đang phân tích và tìm kiếm thông tin...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium shadow-sm animate-in fade-in zoom-in duration-200">
                ⚠️ {error}
              </div>
            </div>
          )}

          {status === 'connecting' && (
            <div className="flex justify-center">
              <div className="max-w-md w-full px-6 py-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-center space-y-2 shadow-sm animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center justify-center gap-2 font-bold mb-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  Dịch vụ thông báo ngoại tuyến
                </div>
                <p className="text-xs text-amber-700/80 leading-relaxed font-medium">
                  Hệ thống đang cố gắng kết nối lại với dịch vụ thông báo. Vui lòng đợi trong giây lát để đảm bảo dữ liệu được đồng bộ chính xác.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          <div className="flex-1">
            <input
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-gray-50 text-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              placeholder={status === 'connecting' ? "Vui lòng đợi kết nối dịch vụ thông báo..." : CHAT_CONFIG.INPUT_PLACEHOLDER}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={status === 'connecting'}
            />
          </div>
          <button
            className="px-5 py-3 bg-gradient-to-r from-violet-600 to-teal-600 hover:from-violet-700 hover:to-teal-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            onClick={handleSend}
            disabled={status === 'connecting' || !input.trim()}
          >
            <Send className="w-4 h-4" />
            <span>{CHAT_CONFIG.SEND_LABEL}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
