import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Check, Lock, Play, Share2, Zap, BookOpen, Clock, Star, Rocket, Bell, Calendar, Edit3, Minus, Plus } from 'lucide-react';
import { useSkillTree, SkillNode } from '@/modules/skill-tree/ui/hooks/useSkillTree';

// Node types for different states
type NodeStatus = 'completed' | 'in-progress' | 'locked';

interface TreeNode extends SkillNode {
  progress?: number; // 0-100 for in-progress nodes
}

export function SkillTree() {
  const { 
    skillNodes, 
    selectedSpecialization, 
    loading, 
    showTree, 
    selectSpecialization, 
    backToSelection,
    specializations
  } = useSkillTree();

  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [focusedBranch, setFocusedBranch] = useState<{
    abilityId?: string;
    skillId?: string;
  } | null>(null);

  useEffect(() => {
    if (showTree) {
      setSelectedNode(null);
      setFocusedBranch(null);
      setZoomLevel(100);
    }
  }, [showTree]);

  // Convert status to new format
  const getNodeStatus = (node: SkillNode): NodeStatus => {
    if (node.status === 'unlocked') return 'completed';
    if (node.status === 'available') return 'in-progress';
    return 'locked';
  };

  // Get visible nodes based on focused branch
  const visibleNodes = useMemo(() => {
    if (!skillNodes || skillNodes.length === 0) return [];
    
    if (!focusedBranch) {
      return skillNodes.filter((node: SkillNode) => node.level <= 1);
    }

    const visible: SkillNode[] = [];
    const root = skillNodes.find(n => n.level === 0);
    if (root) visible.push({...root});

    if (focusedBranch.skillId) {
      const skill = skillNodes.find(n => n.id === focusedBranch.skillId);
      if (skill) {
        visible.push({...skill});
        const parentAbility = skillNodes.find(n => 
          n.level === 1 && n.connections?.includes(skill.id)
        );
        if (parentAbility) visible.push({...parentAbility});
        if (skill.connections?.length > 0) {
          const knowledge = skillNodes.filter(n => 
            n.level === 3 && skill.connections.includes(n.id)
          );
          visible.push(...knowledge.map(n => ({...n})));
        }
      }
    } else if (focusedBranch.abilityId) {
      const ability = skillNodes.find(n => n.id === focusedBranch.abilityId);
      if (ability) {
        visible.push({...ability});
        if (ability.connections?.length > 0) {
          const skills = skillNodes.filter(n => 
            n.level === 2 && ability.connections.includes(n.id)
          );
          visible.push(...skills.map(n => ({...n})));
        }
      }
    }

    return visible;
  }, [skillNodes, focusedBranch]);

  // Reposition nodes for display
  const repositionedNodes = useMemo(() => {
    const nodes = [...visibleNodes];
    const byLevel: Record<number, SkillNode[]> = {};
    
    nodes.forEach(node => {
      if (!byLevel[node.level]) byLevel[node.level] = [];
      byLevel[node.level].push(node);
    });
    
    Object.keys(byLevel).forEach(levelStr => {
      const level = parseInt(levelStr);
      const nodesAtLevel = byLevel[level];
      const count = nodesAtLevel.length;
      
      if (count === 1) {
        nodesAtLevel[0].x = 50;
      } else {
        const spacing = 70 / (count + 1);
        const startX = 15;
        nodesAtLevel.forEach((node, idx) => {
          node.x = startX + (spacing * (idx + 1));
        });
      }
    });
    
    return nodes;
  }, [visibleNodes]);

  const handleNodeClick = (node: SkillNode) => {
    setSelectedNode(node as TreeNode);

    if (node.level === 1) {
      if (focusedBranch?.abilityId === node.id) {
        setFocusedBranch(null);
      } else {
        setFocusedBranch({ abilityId: node.id });
      }
    } else if (node.level === 2) {
      const parentAbility = skillNodes.find(n => 
        n.level === 1 && n.connections?.includes(node.id)
      );
      if (focusedBranch?.skillId === node.id) {
        setFocusedBranch({ abilityId: parentAbility?.id });
      } else {
        setFocusedBranch({ abilityId: parentAbility?.id, skillId: node.id });
      }
    } else if (node.level === 0) {
      setFocusedBranch(null);
    }
  };

  // Generate bezier path between nodes
  const generatePath = (fromX: number, fromY: number, toX: number, toY: number) => {
    const midY = (fromY + toY) / 2;
    return `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
  };

  if (!showTree) {
    // Specialization Selection
    return (
      <div className="flex-1 bg-slate-50 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">Chọn Chuyên Ngành IT</h1>
            <p className="text-lg text-slate-500">
              Khám phá lộ trình học tập chi tiết cho các chuyên ngành công nghệ
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specializations.map((spec) => (
              <button
                key={spec.id}
                onClick={() => selectSpecialization(spec)}
                disabled={loading}
                className="group p-8 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-1"
              >
                <div className="mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${spec.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <span className="text-3xl">{spec.icon}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-indigo-600">
                  {spec.name}
                </h3>
                <div className="mt-6 inline-flex items-center text-indigo-600 font-semibold">
                  Khám phá skill tree
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
          
          {loading && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 shadow-2xl">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-slate-800 font-medium">Đang tải skill tree...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Skill Tree View
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={backToSelection} className="text-slate-400 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-800">{selectedSpecialization?.name}</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100 rounded-full px-3 py-1 gap-2">
            <span className="text-[11px] font-bold text-slate-500">ZOOM</span>
            <button 
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              className="p-1 hover:text-indigo-600 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono w-12 text-center font-bold">{zoomLevel}%</span>
            <button 
              onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
              className="p-1 hover:text-indigo-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={() => { setZoomLevel(100); setFocusedBranch(null); }}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-slate-800 transition-all"
          >
            RESET VIEW
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Tree Canvas */}
        <div className="flex-1 relative overflow-hidden">
          {/* Legend */}
          <div className="absolute top-6 left-8 flex items-center gap-6 bg-white/90 backdrop-blur p-4 rounded-xl border border-slate-200 shadow-sm z-20">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-2 h-2 text-white" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-dashed border-indigo-500"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center">
                <Lock className="w-2 h-2 text-slate-500" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Locked</span>
            </div>
          </div>

          {/* SVG Tree */}
          <svg 
            className="w-full h-full" 
            viewBox="0 0 100 80"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
          >
            {/* Connection Paths */}
            {repositionedNodes.map((node) => {
              const nodeMap = new Map(repositionedNodes.map(n => [n.id, n]));
              return node.connections?.map((targetId) => {
                const target = nodeMap.get(targetId);
                if (!target) return null;
                
                const status = getNodeStatus(node);
                const isCompleted = status === 'completed';
                
                return (
                  <path
                    key={`${node.id}-${targetId}`}
                    d={generatePath(node.x, node.y, target.x, target.y)}
                    fill="none"
                    stroke={isCompleted ? '#6366f1' : '#cbd5e1'}
                    strokeWidth="0.4"
                    strokeLinecap="round"
                    opacity={isCompleted ? 0.6 : 0.4}
                  />
                );
              });
            })}

            {/* Nodes */}
            {repositionedNodes.map((node) => {
              const status = getNodeStatus(node);
              const isSelected = selectedNode?.id === node.id;
              const isExpanded = (node.level === 1 && focusedBranch?.abilityId === node.id) || 
                                (node.level === 2 && focusedBranch?.skillId === node.id);
              
              // Node sizes based on level
              const size = node.level === 0 ? 6 : node.level === 1 ? 5 : 4;
              const radius = size / 2;
              
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => handleNodeClick(node)}
                  className="cursor-pointer"
                  style={{ transition: 'all 0.3s ease' }}
                >
                  {/* Glow effect for active node */}
                  {status === 'in-progress' && (
                    <circle
                      r={radius + 2}
                      fill="url(#glowGradient)"
                      opacity="0.3"
                    />
                  )}

                  {/* Progress ring for in-progress */}
                  {status === 'in-progress' && (
                    <>
                      <circle
                        r={radius + 0.5}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="0.3"
                      />
                      <circle
                        r={radius + 0.5}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="0.3"
                        strokeDasharray={`${2 * Math.PI * (radius + 0.5) * 0.35} ${2 * Math.PI * (radius + 0.5)}`}
                        strokeLinecap="round"
                        transform="rotate(-90)"
                      />
                    </>
                  )}

                  {/* Main node */}
                  <rect
                    x={-radius}
                    y={-radius}
                    width={size}
                    height={size}
                    rx={size * 0.3}
                    fill={
                      status === 'completed' ? '#10b981' :
                      status === 'in-progress' ? '#6366f1' :
                      '#e2e8f0'
                    }
                    stroke={isSelected ? '#6366f1' : 'transparent'}
                    strokeWidth="0.3"
                    className="transition-all hover:opacity-90"
                  />

                  {/* Status icon */}
                  {status === 'completed' && (
                    <g transform={`translate(${radius - 0.8}, ${-radius - 0.5})`}>
                      <circle r="0.8" fill="#059669" stroke="white" strokeWidth="0.15" />
                      <path d="M-0.3 0 L-0.1 0.2 L0.3 -0.2" fill="none" stroke="white" strokeWidth="0.15" />
                    </g>
                  )}

                  {status === 'locked' && (
                    <g transform="translate(0, 0)">
                      <rect x="-0.4" y="-0.3" width="0.8" height="0.6" rx="0.1" fill="#94a3b8" />
                      <path d="M-0.25 -0.3 L-0.25 -0.5 Q0 -0.8 0.25 -0.5 L0.25 -0.3" fill="none" stroke="#94a3b8" strokeWidth="0.15" />
                    </g>
                  )}

                  {/* Node icon for root/ability */}
                  {node.level <= 1 && status !== 'locked' && (
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="2"
                      fontWeight="bold"
                    >
                      {node.level === 0 ? '🧠' : '📊'}
                    </text>
                  )}

                  {/* Label */}
                  <text
                    y={radius + 2}
                    textAnchor="middle"
                    fill={status === 'completed' ? '#059669' : status === 'in-progress' ? '#6366f1' : '#64748b'}
                    fontSize="1.5"
                    fontWeight={status !== 'locked' ? '600' : '400'}
                  >
                    {node.label.length > 15 ? node.label.substring(0, 12) + '...' : node.label}
                  </text>

                  {/* Active indicator */}
                  {isExpanded && (
                    <text
                      y={radius + 4}
                      textAnchor="middle"
                      fill="#6366f1"
                      fontSize="1"
                      fontWeight="bold"
                    >
                      ▼ EXPANDED
                    </text>
                  )}
                </g>
              );
            })}

            {/* Gradient definitions */}
            <defs>
              <radialGradient id="glowGradient">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Detail Panel */}
        <aside className="w-[400px] bg-white border-l border-slate-200 flex flex-col shadow-xl z-20 flex-shrink-0">
          <div className="p-6 h-full overflow-y-auto">
            {selectedNode ? (
              <>
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex flex-col gap-2">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded w-fit tracking-wider uppercase ${
                      getNodeStatus(selectedNode) === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      getNodeStatus(selectedNode) === 'in-progress' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {getNodeStatus(selectedNode) === 'completed' ? 'Đã hoàn thành' :
                       getNodeStatus(selectedNode) === 'in-progress' ? 'Đang học' : 'Bị khóa'}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-800 leading-tight">
                      {selectedNode.fullName}
                    </h3>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-slate-600">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Description */}
                {selectedNode.nodeData?.description && (
                  <div className="mb-6">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Mô tả</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {selectedNode.nodeData.description}
                    </p>
                  </div>
                )}

                {/* Metadata Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {selectedNode.nodeData?.difficultyLevel && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Zap className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Độ khó</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-700">{selectedNode.nodeData.difficultyLevel}</p>
                    </div>
                  )}
                  {selectedNode.nodeData?.estimatedTimeToComplete && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Thời gian</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-700">{selectedNode.nodeData.estimatedTimeToComplete}</p>
                    </div>
                  )}
                  {selectedNode.nodeData?.importanceScore && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Quan trọng</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map((i) => (
                          <span 
                            key={i} 
                            className={`w-1.5 h-1.5 rounded-full ${
                              i <= Math.ceil(selectedNode.nodeData.importanceScore / 3.5) 
                                ? 'bg-amber-500' 
                                : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tools */}
                {selectedNode.nodeData?.tools?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Công cụ</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedNode.nodeData.tools.slice(0, 5).map((tool: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Resources */}
                {selectedNode.nodeData?.learningResources?.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Tài liệu học tập
                      </h4>
                      <span className="text-[10px] font-bold text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded">
                        0/{selectedNode.nodeData.learningResources.length} HOÀN THÀNH
                      </span>
                    </div>
                    <div className="space-y-3">
                      {selectedNode.nodeData.learningResources.slice(0, 3).map((resource: any, idx: number) => {
                        const resourceName = typeof resource === 'string' ? resource : (resource.name || resource.title || 'Tài liệu');
                        const isFirst = idx === 0;
                        
                        return (
                          <div 
                            key={idx} 
                            className={`group p-4 rounded-xl bg-white border transition-all ${
                              isFirst 
                                ? 'border-l-4 border-l-indigo-500 border-slate-200 shadow-sm' 
                                : 'border-slate-200 hover:border-indigo-300'
                            }`}
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isFirst ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {isFirst ? <Play className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold leading-tight truncate ${
                                  isFirst ? 'text-indigo-600' : 'text-slate-700 group-hover:text-indigo-600'
                                }`}>
                                  {resourceName}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  {typeof resource === 'object' && resource.type ? resource.type : 'Tài liệu học tập'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <select className="flex-1 text-[11px] bg-slate-50 border-slate-200 rounded-lg py-1.5 font-medium focus:ring-indigo-500 focus:border-indigo-500">
                                <option>Chưa bắt đầu</option>
                                <option>Đang học</option>
                                <option>Hoàn thành</option>
                              </select>
                              <div className="flex gap-1">
                                <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                  <Bell className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                  <Calendar className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Project Ideas */}
                {selectedNode.nodeData?.projectIdeas?.length > 0 && (
                  <div className="mb-6 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
                    <h4 className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Rocket className="w-4 h-4" /> Ý tưởng dự án
                    </h4>
                    <p className="text-xs font-semibold text-slate-700 mb-1">
                      {typeof selectedNode.nodeData.projectIdeas[0] === 'string' 
                        ? selectedNode.nodeData.projectIdeas[0] 
                        : selectedNode.nodeData.projectIdeas[0]?.title}
                    </p>
                    {typeof selectedNode.nodeData.projectIdeas[0] === 'object' && (
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {selectedNode.nodeData.projectIdeas[0].description}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-8 space-y-3 pt-6 border-t border-slate-100">
                  {getNodeStatus(selectedNode) !== 'locked' && (
                    <button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                      <Zap className="w-5 h-5" /> Bắt đầu học
                    </button>
                  )}
                  <button className="w-full py-3 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4" /> Làm bài kiểm tra
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-10 h-10 text-slate-300" />
                </div>
                <p className="font-medium">Chọn một node để xem chi tiết</p>
                <p className="text-sm mt-2">Click vào các skill trên cây để bắt đầu</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
