import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, MessageSquare, Plus, Loader2, ChevronDown } from 'lucide-react';

export interface ChatSession {
  id: string;
  title: string | null;
  context_data?: {
    tree_nodes?: any[];
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

interface ChatHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  loadingMore: boolean;
}

export function ChatHistoryDialog({ 
  isOpen,
  onClose,
  sessions, 
  loading, 
  hasMore, 
  onLoadMore,
  loadingMore 
}: ChatHistoryDialogProps) {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  if (!isOpen) return null;

  const handleNewChat = () => {
    navigate('/chat');
    onClose();
  };

  const handleSelectSession = (id: string) => {
    navigate(`/chat/c/${id}`);
    onClose();
  };

  const truncateTitle = (title: string | null, maxLength: number = 40) => {
    if (!title) return 'Cuộc trò chuyện mới';
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="fixed inset-x-4 top-20 bottom-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[480px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-100">
              <MessageSquare className="w-5 h-5 text-violet-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Lịch sử chat</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-4 py-3 border-b border-gray-100">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-teal-600 hover:from-violet-700 hover:to-teal-700 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Cuộc trò chuyện mới</span>
          </button>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
              <p>Chưa có cuộc trò chuyện nào</p>
            </div>
          ) : (
            <div className="py-2">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={`w-full text-left px-6 py-3 transition-colors flex items-center gap-3 group hover:bg-gray-50 ${
                    sessionId === session.id ? 'bg-violet-50' : ''
                  }`}
                >
                  <MessageSquare className={`w-4 h-4 flex-shrink-0 ${
                    sessionId === session.id ? 'text-violet-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${
                      sessionId === session.id ? 'text-violet-900 font-medium' : 'text-gray-700'
                    }`}>
                      {truncateTitle(session.title)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(session.updated_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && !loading && sessions.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100">
              <button
                onClick={onLoadMore}
                disabled={loadingMore}
                className="w-full flex items-center justify-center gap-2 text-sm text-violet-600 hover:text-violet-700 py-2 hover:bg-violet-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Tải thêm
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
