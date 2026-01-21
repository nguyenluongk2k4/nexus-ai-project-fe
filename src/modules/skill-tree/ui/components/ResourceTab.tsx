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
    
    const shouldFetch = !nodeData?.learningResources || nodeData.learningResources.length === 0;
    
    if (shouldFetch) {
       setLoadingResources(true);
       getSkillTreeService().getNodeResources(selectedNode.id)
         .then(resources => {
            if (resources && resources.length > 0) {
               // Update the tree node data directly via service to trigger reactivity
               treeNodeService.setResources({ [selectedNode.id]: resources });
            }
         })
         .finally(() => setLoadingResources(false));
    }
  }, [selectedNode?.id]);

  // Helper helper to normalize status
  const normalizeStatus = (status: string) => status.replace('_', '-');
  const denormalizeStatus = (status: string) => status.replace('-', '_');

  const handleStatusUpdate = async (resourceId: string, newStatus: string) => {
    try {
       // Send underscore to API
       const apiStatus = denormalizeStatus(newStatus);
       await getSkillTreeService().updateResourceStatus(resourceId, apiStatus as any);
       
       // Update local state (keep underscores in data if that's what comes from API, 
       // but we might want to standardize. Let's assume data is underscores.)
       const updatedResources = nodeData.learningResources.map((r: any) => 
          (r.id === resourceId) ? { ...r, status: apiStatus } : r
       );
       
       treeNodeService.setResources({
         [selectedNode.id]: updatedResources
       });
       
    } catch (e) {
       console.error("Failed to update status", e);
    }
  };

  // // Helper for rendering status dropdown
  // const renderStatusDropdown = (resourceId: string, currentStatus: string) => {
  //   // Normalize for UI (dashes)
  //   const uiStatus = normalizeStatus(currentStatus);
    
  //   // If not started, show "Start Learning" primary button
  //   if (uiStatus === 'not-started') {
  //       return (
  //           <button 
  //               onClick={() => handleStatusUpdate(resourceId, 'in-progress')}
  //               className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-95"
  //           >
  //               <Play className="w-3.5 h-3.5 fill-current" />
  //               Bắt đầu học
  //           </button>
  //       );
  //   }

  //   // Otherwise show status badge/dropdown
  //   return (
  //   <div className="flex items-center gap-2">
  //     <div className="relative group">
  //       <button className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-medium text-slate-700 hover:bg-slate-100 transition-colors">
  //         {uiStatus === 'completed' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
  //         {uiStatus === 'in-progress' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
          
  //         {uiStatus === 'completed' ? 'Đã hoàn thành' : 
  //          uiStatus === 'in-progress' ? 'Đang học' : 'Chưa bắt đầu'}
  //         <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
  //       </button>
        
  //       {/* Dropdown Menu */}
  //       <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-100 py-1 hidden group-hover:block z-10">
  //         {(['not-started', 'in-progress', 'completed'] as const).map((s) => (
  //            <button 
  //              key={s}
  //              onClick={() => handleStatusUpdate(resourceId, s === 'not-started' ? 'not_started' : s)}
  //              className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-slate-50 flex items-center gap-2"
  //            >
  //               <span className={`w-1.5 h-1.5 rounded-full ${
  //                 s === 'completed' ? 'bg-emerald-500' :
  //                 s === 'in-progress' ? 'bg-indigo-500' : 'bg-slate-400'
  //               }`} />
  //               {s === 'completed' ? 'Đã hoàn thành' : s === 'in-progress' ? 'Đang học' : 'Chưa bắt đầu'}
  //            </button>
  //         ))}
  //       </div>
  //     </div>
  //   </div>
  // )};

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Header Badge & Share */}
      <div className="flex items-start justify-between mb-3">
        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${
          status === 'in-progress' ? 'bg-indigo-100 text-indigo-700' :
          status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
          'bg-slate-100 text-slate-500'
        }`}>
          {status === 'in-progress' ? 'Đang tập trung' :
           status === 'completed' ? 'Hoàn thành' : 'Chưa mở khóa'}
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
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mô tả</h4>
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
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Độ khó</span>
          </div>
          <span className="text-sm font-bold text-slate-700 capitalize">
            {nodeData?.difficultyLevel || 'Trung bình'}
          </span>
        </div>

        {/* Time */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between h-20">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Thời gian ước tính</span>
          </div>
          <span className="text-sm font-bold text-slate-700">
            {nodeData?.estimatedTimeToComplete || '2-4 Tuần'}
          </span>
        </div>

        {/* Importance */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between h-20">
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Độ quan trọng</span>
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
            <span className="text-xs font-bold text-slate-700">Cao</span>
          </div>
        </div>
      </div>

      {/* Project Application */}
      <div className="mb-6 bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Rocket className="w-4 h-4 text-indigo-600" />
          <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Ứng dụng thực tế</h4>
        </div>
        <div>
          <h5 className="text-sm font-bold text-slate-800 mb-1">
             {typeof nodeData?.projectIdeas?.[0] === 'object' ? nodeData.projectIdeas[0].title : 'Triển khai dự án mẫu'}
          </h5>
          <p className="text-xs text-slate-600 leading-relaxed">
            {typeof nodeData?.projectIdeas?.[0] === 'string' 
              ? nodeData.projectIdeas[0] 
              : nodeData?.projectIdeas?.[0]?.description || (nodeData?.projectIdeas ? "Áp dụng các kiến thức vào kịch bản thực tế." : "Sử dụng kỹ năng này để xây dựng một module chức năng trong dự án hiện tại của bạn.")}
          </p>
        </div>
      </div>

      {/* Learning Resources */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tài liệu học tập</h4>
          </div>
          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-bold">
            {nodeData?.learningResources ? `${nodeData.learningResources.filter((r: any) => normalizeStatus(r?.status || '') === 'completed').length}/${nodeData.learningResources.length} HOÀN THÀNH` : '0/0 HOÀN THÀNH'}
          </span>
        </div>

        <div className="space-y-3">
          {loadingResources ? (
             <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-xs text-slate-500">Đang tải tài liệu...</p>
             </div>
          ) : nodeData?.learningResources?.length > 0 ? (
            nodeData.learningResources.map((resource: any, idx: number) => {
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
                               {status === 'completed' ? 'Hoàn thành' : 
                                status === 'in-progress' ? 'Đang học' : 'Chưa học'}
                           </span>
                      </div>
                      
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        {resource.type || 'Khóa học'} • {resource.duration_minutes ? `${Math.round(resource.duration_minutes/60)} Giờ` : 'Tự học'}
                      </p>
                    </div>
                  </div>

                  {/* Actions Row */}
                  {/* <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    {renderStatusDropdown(resource.id, rawStatus)}
                    
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors" title="Nhắc nhở">
                        <Bell className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors" title="Lên lịch">
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors" title="Ghi chú">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div> */}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Chưa có tài liệu nào cho kỹ năng này.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
