import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, BookOpen, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChatTab } from './ChatTab';
import { ResourceTab } from './ResourceTab';
import { SkillNode } from '../hooks/useSkillTree';
import { Message, ConnectionStatus } from '@/modules/chat/domain/entities/Message';
import { ChatSession } from '@/modules/chat/ui/components/ChatSessionList';

import { UploadResponse } from '@/modules/chat/domain/entities/UploadResponse';

type TabType = 'chat' | 'resource';

interface RightPanelProps {
  // Node props
  selectedNode: SkillNode | null;
  getNodeStatus: (node: SkillNode) => 'completed' | 'in-progress' | 'locked';

  // Chat props
  messages: Message[];
  status: ConnectionStatus;
  sessionStatus?: 'idle' | 'rendering' | 'error';
  error?: string | null;
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

  // Panel state
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;

  // Tab state (Controlled)
  activeTab?: 'chat' | 'resource';
  onTabChange?: (tab: 'chat' | 'resource') => void;

  // Customization
  hideChat?: boolean;

  // Upload Props passed from useChat
  uploadFile?: (file: File) => Promise<UploadResponse>;
  attachments?: UploadResponse[];
  isUploading?: boolean;
  removeAttachment?: (index: number) => void;

  // Callback for resource status changes
  onResourceUpdate?: () => void;
}

export function RightPanel({
  selectedNode,
  getNodeStatus,
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
  isCollapsed = false,
  onToggleCollapse,
  activeTab: controlledTab,
  onTabChange,
  hideChat = false,
  uploadFile,
  attachments,
  isUploading,
  removeAttachment,
  onResourceUpdate
}: RightPanelProps) {
  const { t } = useTranslation();
  const [internalTab, setInternalTab] = useState<TabType>('chat');

  // Use controlled state if provided, otherwise internal state
  const activeTab = controlledTab !== undefined ? controlledTab : internalTab;

  const handleTabChange = (tab: TabType) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  if (isCollapsed) {
    return (
      <div className="hidden md:flex w-12 bg-white border-l border-slate-200 flex-col items-center py-4 gap-2">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-200" />
        {!hideChat && (
          <button
            onClick={() => { handleTabChange('chat'); onToggleCollapse?.(); }}
            className={`p-2 rounded-lg ${activeTab === 'chat' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => { handleTabChange('resource'); onToggleCollapse?.(); }}
          className={`p-2 rounded-lg ${activeTab === 'resource' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
        >
          <BookOpen className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-30 md:static md:inset-auto w-full md:w-[480px] bg-white border-l border-slate-200 flex flex-col shadow-lg flex-shrink-0 h-full">
      {/* Tab Bar */}
      <div className="flex items-center border-b border-slate-200">
        {!hideChat && (
          <button
            onClick={() => handleTabChange('chat')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'chat'
              ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
          >
            <MessageSquare className="w-4 h-4" />
            {t('skillTree.rightPanel.tabs.chat')}
          </button>
        )}
        <button
          onClick={() => handleTabChange('resource')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'resource'
            ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
        >
          <BookOpen className="w-4 h-4" />
          {t('skillTree.rightPanel.tabs.resource')}
          {selectedNode && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          )}
        </button>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-2 mr-2 hover:bg-slate-100 rounded-lg text-slate-400"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' ? (
          <ChatTab
            messages={messages}
            status={status}
            sessionStatus={sessionStatus}
            error={error || null}
            onSend={onSend}
            onClearError={onClearError}
            sessions={sessions}
            sessionsLoading={sessionsLoading}
            hasMore={hasMore}
            onLoadMore={onLoadMore}
            loadingMore={loadingMore}
            currentSessionId={currentSessionId}
            onSelectSession={onSelectSession}
            onNewChat={onNewChat}
            uploadFile={uploadFile}
            attachments={attachments}
            isUploading={isUploading}
            removeAttachment={removeAttachment}
          />
        ) : (
          <ResourceTab
            selectedNode={selectedNode}
            getNodeStatus={getNodeStatus}
            onResourceUpdate={onResourceUpdate}
          />
        )}
      </div>
    </div>
  );
}
