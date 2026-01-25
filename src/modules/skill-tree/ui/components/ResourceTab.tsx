import { useState, useEffect } from 'react';
import { Share2, Zap, Clock, Star, BookOpen, Play, Bell, Calendar, Edit3, Rocket, Check, ChevronDown, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SkillNode } from '../hooks/useSkillTree';
import { getSkillTreeService } from '../../providers';
import { treeNodeService } from '../../domain/services/treeNodeService';

type NodeStatus = 'completed' | 'in-progress' | 'locked';

interface ResourceTabProps {
  selectedNode: SkillNode | null;
  getNodeStatus: (node: SkillNode) => NodeStatus;
}

export function ResourceTab({ selectedNode, getNodeStatus }: ResourceTabProps) {
  const { t } = useTranslation();

  // Local state for resources (moved up to avoid conditional hook error)
  const [resources, setResources] = useState<any[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  
  const status = selectedNode ? getNodeStatus(selectedNode) : 'locked';
  const nodeData = selectedNode?.nodeData;

  // Sync resources from props or fetch
  useEffect(() => {
    if (!selectedNode?.id) return;
    
    // If props have resources, use them (priority source of truth)
    if (nodeData?.learningResources && nodeData.learningResources.length > 0) {
      setResources(nodeData.learningResources);
      return;
    }
    
    // Otherwise fetch
    setLoadingResources(true);
    getSkillTreeService().getNodeResources(selectedNode.id)
      .then(res => {
         if (res) {
            setResources(res);
            // Still update service for other consumers if needed
            if (res.length > 0) {
               treeNodeService.setResources({ [selectedNode.id]: res });
            }
         }
      })
      .catch(err => {
        console.error("Failed to load resources:", err);
        setResources([]); 
      })
      .finally(() => setLoadingResources(false));
  }, [selectedNode?.id, nodeData?.learningResources]);

  if (!selectedNode) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6">
        <BookOpen className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm font-medium">{t('mySkillTree.panel.selectNodePrompt')}</p>
        <p className="text-xs mt-1">{t('mySkillTree.panel.clickNodeHint')}</p>
      </div>
    );
  }

  // Helper helper to normalize status
  const normalizeStatus = (status: string) => status.replace('_', '-');
  const denormalizeStatus = (status: string) => status.replace('-', '_');

  const handleStatusUpdate = async (resourceId: string, newStatus: string) => {
    try {
       // Send underscore to API
       const apiStatus = denormalizeStatus(newStatus);
       await getSkillTreeService().updateResourceStatus(resourceId, apiStatus as any);
       
       // Update local state
       setResources(prev => prev.map((r: any) => 
          (r.id === resourceId) ? { ...r, status: apiStatus } : r
       ));
       
       // Update global service (best effort)
       if (nodeData?.learningResources) {
         const updatedResources = nodeData.learningResources.map((r: any) => 
            (r.id === resourceId) ? { ...r, status: apiStatus } : r
         );
         treeNodeService.setResources({
           [selectedNode.id]: updatedResources
         });
       }
       
    } catch (e) {
       console.error("Failed to update status", e);
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === 'in-progress') return t('mySkillTree.panel.status.focusing');
    if (status === 'completed') return t('mySkillTree.panel.status.completed');
    return t('mySkillTree.panel.status.locked');
  };

  const formattedDuration = (minutes?: number) => {
    if (!minutes) return t('mySkillTree.panel.types.selfStudy');
    return `${Math.round(minutes/60)} ${t('mySkillTree.panel.types.hours')}`;
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Header Badge & Share */}
      <div className="flex items-start justify-between mb-3">
        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${
          status === 'in-progress' ? 'bg-indigo-100 text-indigo-700' :
          status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
          'bg-slate-100 text-slate-500'
        }`}>
          {getStatusLabel(status)}
        </span>
        <button className="text-slate-400 hover:text-slate-600">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Title & Description */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 leading-tight mb-2">
          {selectedNode.fullName}
        </h2>
        <div className="mt-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{t('mySkillTree.panel.description')}</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            {nodeData?.description || "Nắm vững các khái niệm và ứng dụng thực tế của kỹ năng này để thăng tiến trong sự nghiệp."}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Difficulty */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between h-20">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t('mySkillTree.panel.difficulty')}</span>
          </div>
          <span className="text-sm font-bold text-slate-700 capitalize">
            {nodeData?.difficultyLevel || t('mySkillTree.panel.levels.medium')}
          </span>
        </div>

        {/* Time */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between h-20">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t('mySkillTree.panel.timeEstimate')}</span>
          </div>
          <span className="text-sm font-bold text-slate-700">
            {nodeData?.estimatedTimeToComplete || `2-4 ${t('mySkillTree.panel.types.weeks')}`}
          </span>
        </div>

        {/* Importance */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between h-20">
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t('mySkillTree.panel.importance')}</span>
          </div>
          <div>
            <div className="flex gap-1 mb-1">
              {[1, 2, 3].map((i) => (
                <span 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full ${
                    i <= Math.ceil((nodeData?.importanceScore || 3) / 3.5 * 3)
                      ? 'bg-amber-400' 
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700">{t('mySkillTree.panel.levels.high')}</span>
          </div>
        </div>
      </div>

      {/* Project Application */}
      <div className="mb-6 bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Rocket className="w-4 h-4 text-indigo-600" />
          <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{t('mySkillTree.panel.practicalApp')}</h4>
        </div>
        <div>
          <h5 className="text-sm font-bold text-slate-800 mb-1">
             {typeof nodeData?.projectIdeas?.[0] === 'object' ? nodeData.projectIdeas[0].title : t('mySkillTree.panel.defaultProjectTitle')}
          </h5>
          <p className="text-xs text-slate-600 leading-relaxed">
            {typeof nodeData?.projectIdeas?.[0] === 'string' 
              ? nodeData.projectIdeas[0] 
              : nodeData?.projectIdeas?.[0]?.description || (nodeData?.projectIdeas ? "Áp dụng các kiến thức vào kịch bản thực tế." : t('mySkillTree.panel.defaultProjectDesc'))}
          </p>
        </div>
      </div>

      {/* Learning Resources */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('mySkillTree.panel.resources')}</h4>
          </div>
          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-bold">
            {resources.length > 0 ? `${resources.filter((r: any) => normalizeStatus(r?.status || '') === 'completed').length}/${resources.length} ${t('mySkillTree.panel.completedCount')}` : `0/0 ${t('mySkillTree.panel.completedCount')}`}
          </span>
        </div>

        <div className="space-y-3">
          {loadingResources ? (
             <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-xs text-slate-500">{t('mySkillTree.panel.loadingResources')}</p>
             </div>
          ) : resources.length > 0 ? (
            resources.map((resource: any, idx: number) => {
              const resourceName = typeof resource === 'string' ? resource : (resource.name || resource.title || 'Learning Resource');
              const rawStatus = resource.status || 'not_started';
              const status = normalizeStatus(rawStatus);
              
              return (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-indigo-200 transition-colors">
                  <div className="flex items-start gap-3 mb-4">
                    {/* Icon Box */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                      status === 'in-progress' ? 'bg-indigo-100 text-indigo-600' :
                      'bg-slate-100 text-slate-400'
                    }`}>
                      {status === 'completed' ? <Check className="w-5 h-5" /> :
                       status === 'in-progress' ? <Play className="w-5 h-5 fill-current" /> :
                       <Lock className="w-5 h-5" />}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold text-slate-800 mb-0.5 truncate pr-2" title={resourceName}>{resourceName}</h4>
                          
                           {/* Status Tag */}
                           <span className={`flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                                status === 'in-progress' ? 'bg-indigo-100 text-indigo-600' :
                                'bg-slate-100 text-slate-400'
                           }`}>
                               {status === 'completed' ? t('mySkillTree.panel.status.completed') : 
                                status === 'in-progress' ? t('mySkillTree.panel.status.inProgress') : t('mySkillTree.panel.status.notStarted')}
                           </span>
                      </div>
                      
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        {resource.type || t('mySkillTree.panel.types.course')} • {formattedDuration(resource.duration_minutes)}
                      </p>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-auto">
                    {status === 'not-started' ? (
                       <button 
                          onClick={() => handleStatusUpdate(resource.id, 'in-progress')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all"
                       >
                          <Play className="w-3 h-3 fill-current" />
                          {t('mySkillTree.panel.learnNow')}
                       </button>
                    ) : (
                       <button 
                          onClick={() => handleStatusUpdate(resource.id, status === 'completed' ? 'not_started' : 'completed')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                             status === 'completed' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                       >
                          {status === 'completed' ? <Check className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                          {status === 'completed' ? t('mySkillTree.panel.finished') : t('mySkillTree.panel.markFinished')}
                       </button>
                    )}
                    
                    <div className="flex items-center gap-1">
                      {resource.url && (
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title={t('mySkillTree.panel.openResource')}
                        >
                          <Rocket className="w-4 h-4" />
                        </a>
                      )}
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors" title={t('mySkillTree.panel.addToCalendar')}>
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">{t('mySkillTree.panel.emptyResources')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
