import React from 'react';
import { SkillNode } from '../hooks/useSkillTree';

interface NodeTooltipProps {
  node: SkillNode;
  position: { x: number; y: number };
  progress?: number;
}

export const NodeTooltip: React.FC<NodeTooltipProps> = ({ node, position }) => {
  if (!node) return null;

  return (
    <div 
      className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-white rounded-xl shadow-xl border border-slate-200 p-4 max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-200"
      style={{ left: position.x, top: position.y }}
    >
      <div className="flex items-start gap-3 mb-3">
         <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0 ${
           node.level === 0 ? 'bg-indigo-600' :
           node.level === 1 ? 'bg-violet-500' : 
           node.level === 2 ? 'bg-fuchsia-500' : 'bg-pink-500'
         }`}>
           {node.level === 0 ? '🧠' : node.level === 1 ? 'A' : node.level === 2 ? 'S' : 'K'}
         </div>
         <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-800 leading-tight mb-1">{node.fullName || node.label}</h4>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium uppercase tracking-wider">{node.type}</span>
              {node.nodeData?.difficultyLevel && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${
                  node.nodeData.difficultyLevel === 'beginner' ? 'bg-green-100 text-green-700' :
                  node.nodeData.difficultyLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {node.nodeData.difficultyLevel}
                </span>
              )}
              {node.nodeData?.estimatedTimeToComplete && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                  {node.nodeData.estimatedTimeToComplete}
                </span>
              )}
            </div>
         </div>
      </div>
      
      {node.nodeData?.description && (
        <p className="text-xs text-slate-600 leading-relaxed">
          {node.nodeData.description}
        </p>
      )}
      
      {/* Arrow */}
      <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-slate-200"></div>
    </div>
  );
};
