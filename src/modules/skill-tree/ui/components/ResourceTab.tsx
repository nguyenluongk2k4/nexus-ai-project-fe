import { useState, useEffect } from 'react';
import { Share2, Zap, Clock, Star, BookOpen, Play, Bell, Calendar, Edit3, Rocket, Check, ChevronDown, Lock } from 'lucide-react';
import { SkillNode } from '../hooks/useSkillTree';
import { getSkillTreeService } from '../../providers';
import { treeNodeService } from '../../domain/services/treeNodeService';

type NodeStatus = 'completed' | 'in-progress' | 'locked';

interface ResourceTabProps {
  selectedNode: SkillNode | null;
  getNodeStatus: (node: SkillNode) => NodeStatus;
}

export function ResourceTab({ selectedNode, getNodeStatus }: ResourceTabProps) {
  if (!selectedNode) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6">
        <BookOpen className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm font-medium">Chọn một node để xem chi tiết</p>
        <p className="text-xs mt-1">Click vào skill trên cây</p>
      </div>
    );
  }

  const status = getNodeStatus(selectedNode);
  const { nodeData } = selectedNode;
  
  // Lazy load resources
  const [loadingResources, setLoadingResources] = useState(false);
  
  useEffect(() => {
    if (!selectedNode?.id) return;
    
    // Check if resources are missing or empty (mock data might be different)
    // We assume if node is from API, it might have empty resources initially.
    // We can also check a 'resourcesLoaded' flag if we adding one, but for now just check length or always fetch?
    // User requested: "check based on 2 cases: reload old chat, new chat".
    // In both cases, if we don't have resources, we should fetch.
    // If we already have them (cached in treeState), maybe we skip?
    // Let's assume we fetch if missing.
    
    const shouldFetch = !nodeData?.learningResources || nodeData.learningResources.length === 0;
    
    if (shouldFetch) {
       setLoadingResources(true);
       getSkillTreeService().getNodeResources(selectedNode.id)
         .then(resources => {
            if (resources && resources.length > 0) {
               treeNodeService.setResources({ [selectedNode.id]: resources });
            }
         })
         .finally(() => setLoadingResources(false));
    }
  }, [selectedNode?.id]);

  // Helper for rendering status dropdown (mock UI)
  const renderStatusDropdown = (currentStatus: 'completed' | 'in-progress' | 'not-started') => (
    <div className="flex items-center gap-2">
      <button className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-medium text-slate-700 hover:bg-slate-100 transition-colors">
        {currentStatus === 'completed' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
        {currentStatus === 'in-progress' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
        {currentStatus === 'not-started' && <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
        
        {currentStatus === 'completed' ? 'Completed' : 
         currentStatus === 'in-progress' ? 'In Progress' : 'Not Started'}
        <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
      </button>
    </div>
  );

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Header Badge & Share */}
      <div className="flex items-start justify-between mb-3">
        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${
          status === 'in-progress' ? 'bg-indigo-100 text-indigo-700' :
          status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
          'bg-slate-100 text-slate-500'
        }`}>
          {status === 'in-progress' ? 'Current Focus' :
           status === 'completed' ? 'Completed' : 'Locked'}
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
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            {nodeData?.description || "Master the concepts and practical applications of this skill to advance your career."}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Difficulty */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between h-20">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Difficulty</span>
          </div>
          <span className="text-sm font-bold text-slate-700 capitalize">
            {nodeData?.difficultyLevel || 'Medium'}
          </span>
        </div>

        {/* Time */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between h-20">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Est. Time</span>
          </div>
          <span className="text-sm font-bold text-slate-700">
            {nodeData?.estimatedTimeToComplete || '2-4 Weeks'}
          </span>
        </div>

        {/* Importance */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between h-20">
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Importance</span>
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
            <span className="text-xs font-bold text-slate-700">High</span>
          </div>
        </div>
      </div>

      {/* Project Application */}
      <div className="mb-6 bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Rocket className="w-4 h-4 text-indigo-600" />
          <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Project Application</h4>
        </div>
        <div>
          <h5 className="text-sm font-bold text-slate-800 mb-1">
             {typeof nodeData?.projectIdeas?.[0] === 'object' ? nodeData.projectIdeas[0].title : 'Practical Implementation'}
          </h5>
          <p className="text-xs text-slate-600 leading-relaxed">
            {typeof nodeData?.projectIdeas?.[0] === 'string' 
              ? nodeData.projectIdeas[0] 
              : nodeData?.projectIdeas?.[0]?.description || (nodeData?.projectIdeas ? "Implement the concepts in a real-world scenario." : "Apply this skill to build a functional module in your current project.")}
          </p>
        </div>
      </div>

      {/* Learning Resources */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Learning Resources</h4>
          </div>
          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-bold">
            {loadingResources ? 'LOADING...' : nodeData?.learningResources ? `0/${nodeData.learningResources.length} COMPLETE` : '0/0 COMPLETE'}
          </span>
        </div>

        <div className="space-y-3">
          {loadingResources ? (
             // Skeleton Loader
             <>
               {[1, 2, 3].map((i) => (
                 <div key={i} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm animate-pulse">
                   <div className="flex items-start gap-3 mb-4">
                     <div className="w-10 h-10 rounded-lg bg-slate-200 flex-shrink-0" />
                     <div className="flex-1 min-w-0">
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                     </div>
                   </div>
                   <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                      <div className="h-6 w-20 bg-slate-200 rounded" />
                      <div className="flex gap-1">
                        <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                        <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                      </div>
                   </div>
                 </div>
               ))}
             </>
          ) : nodeData?.learningResources?.length > 0 ? (
            nodeData.learningResources.map((resource: any, idx: number) => {
              const resourceName = typeof resource === 'string' ? resource : (resource.name || resource.title || 'Learning Resource');
              // Mock status for visual variety
              const mockStatus = idx === 0 ? 'completed' : idx === 1 ? 'in-progress' : 'not-started';
              
              return (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-indigo-200 transition-colors">
                  <div className="flex items-start gap-3 mb-4">
                    {/* Icon Box */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      mockStatus === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                      mockStatus === 'in-progress' ? 'bg-indigo-100 text-indigo-600' :
                      'bg-slate-100 text-slate-400'
                    }`}>
                      {mockStatus === 'completed' ? <Check className="w-5 h-5" /> :
                       mockStatus === 'in-progress' ? <Play className="w-5 h-5 fill-current" /> :
                       <Lock className="w-5 h-5" />}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 mb-0.5 truncate" title={resourceName}>{resourceName}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        {resource.type || 'Course'} • {resource.duration_minutes ? `${Math.round(resource.duration_minutes/60)} Hours` : 'self-paced'}
                      </p>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    {renderStatusDropdown(mockStatus as any)}
                    
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <Bell className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">No resources available for this node yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
