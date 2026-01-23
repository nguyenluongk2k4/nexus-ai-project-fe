import React from 'react';
import { X, BookOpen, ExternalLink, Clock, CalendarPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { skillTreeGateway, httpLearningGateway } from '../../providers';
import { toast } from 'sonner';

interface UserSkillNode {
  id: string;
  name: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percent: number;
  level: number;
  parent_id?: string;
  icon?: string;
  color?: string;
}

interface ResourcePanelProps {
  isOpen: boolean;
  node: UserSkillNode | null;
  onClose: () => void;
  isInline?: boolean;
}

export function ResourcePanel({ isOpen, node, onClose, isInline = false }: ResourcePanelProps) {
  const { t } = useTranslation();
  const [resources, setResources] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (node?.id) {
      loadResources(node.id);
    }
  }, [node?.id]);

  const loadResources = async (nodeId: string) => {
    setLoading(true);
    try {
      const data = await skillTreeGateway.getNodeResources(nodeId);
      setResources(data);
    } catch (error) {
      console.error('Failed to load resources:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleStartLearning = async (resource?: any) => {
    try {
      if (!node) return;
      
      // If resource provided, learn that resource. Else learn the node.
      const isNodeGoal = !resource;
      const title = resource ? (resource.title || resource.name) : node.name;
      const resId = resource ? (resource.id || `res-${Date.now()}`) : `node-${node.id}`;

      const newItem = {
        resourceId: resId,
        nodeName: node.name,
        resourceName: title || 'Learning Task',
        scheduledDate: new Date().toISOString(),
        priority: 'medium',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +1 week
        status: 'not_started'
      };

      await httpLearningGateway.addTimelineItem(newItem);
      
      toast.success(t('common.success') || 'Added to learning schedule');
    } catch (error) {
      console.error('Failed to start learning:', error);
      toast.error(t('common.error'));
    }
  };

  if (!isOpen) return null;

  const content = (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 bg-indigo-600 text-white p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {node && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">
                    {node.level === 0 ? '🧠' : 
                     node.level === 1 ? '⭐' : 
                     node.level === 2 ? '💡' : '📖'}
                  </span>
                  <h2 className="text-xl font-bold">{node.name}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    node.status === 'completed' ? 'bg-green-500/20 text-green-100' :
                    node.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-100' :
                    'bg-white/20 text-white'
                  }`}>
                    {node.status === 'completed' ? t('mySkillTree.status.completed') :
                     node.status === 'in_progress' ? t('mySkillTree.status.inProgress') :
                     t('mySkillTree.status.notStarted')}
                  </span>
                  <span className="text-sm text-white/80">
                    Level {node.level}
                  </span>
                </div>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Progress Bar */}
        {node && (
          <>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-500 rounded-full"
                style={{ width: `${node.progress_percent}%` }}
              />
            </div>
            <p className="text-xs text-white/80 mt-1">
              {node.progress_percent}% {t('mySkillTree.completed')}
            </p>
          </>
        )}
      </div>

      {/* Content - scrollable */}
      {node && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Description */}
          {node.description && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t('mySkillTree.panel.description')}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {node.description}
              </p>
            </div>
          )}

          {/* Learning Resources Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {t('mySkillTree.panel.resources')}
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center p-8">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : resources.length > 0 ? (
              <div className="space-y-3">
                {resources.map((resource, index) => (
                  <div key={resource.id || index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors group relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartLearning(resource);
                      }}
                      className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50 text-indigo-600 z-10"
                      title={t('common.addToSchedule') || "Add to Schedule"}
                    >
                      <CalendarPlus className="w-4 h-4" />
                    </button>
                    
                    <div className="cursor-pointer" onClick={() => window.open(resource.url, '_blank')}>
                      <div className="flex items-start justify-between mb-2 pr-10">
                        <h4 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {resource.title}
                        </h4>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">
                        {resource.description || 'No description available'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        {resource.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {resource.duration}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full font-medium ${
                          resource.type === 'video' ? 'bg-blue-100 text-blue-700' :
                          resource.type === 'article' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {resource.type || 'Resource'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
               <div className="text-center p-6 bg-slate-50 rounded-lg text-slate-500">
                 No resources available yet.
               </div>
            )}
          </div>

          {/* Action Button */}
          <button 
            onClick={() => handleStartLearning(undefined)}
            className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
          >
            {node.status === 'completed' 
              ? t('mySkillTree.panel.review')
              : t('mySkillTree.panel.startLearning')
            }
          </button>
        </div>
      )}
    </div>
  );

  // Inline mode 
  if (isInline) {
    return content;
  }

  // Fixed mode
  return (
    <div className="fixed right-0 top-[73px] bottom-[80px] w-96 bg-white border-l border-slate-200 z-30 overflow-y-auto transform transition-transform duration-300 ease-out">
      {content}
    </div>
  );
}
