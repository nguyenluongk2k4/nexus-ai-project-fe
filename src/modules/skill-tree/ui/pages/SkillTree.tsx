import { useState, useEffect, useMemo } from 'react';
import { Check, Lock, Minus, Plus, MessageSquare, Loader2, Settings } from 'lucide-react';
import { useSkillTree, SkillNode } from '@/modules/skill-tree/ui/hooks/useSkillTree';
import { useChat } from '@/modules/chat/ui/hooks/useChat';
import { RightPanel } from '../components/RightPanel';
import { NodeManagementModal } from '../components/NodeManagementModal';

import { NodeTooltip } from '../components/NodeTooltip';
import { treeState$, TreeNodeData, TreeState, treeNodeService } from '../../domain/services/treeNodeService';

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

  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [visibleLevels, setVisibleLevels] = useState<number[]>([0, 1, 2, 3]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [focusedBranch, setFocusedBranch] = useState<{
    abilityId?: string;
    skillId?: string;
  } | null>(null);

  useEffect(() => {
    if (showTree) {
       setSelectedNode(null);
       setExpandedNodes(new Set());
       setFocusedBranch(null);
       setZoomLevel(1);
    }
  }, [showTree]);

    // Chat hook for right panel (disable navigation on new chat/session)
    const {
      messages,
      status,
      error,
      clearError,
      send,
      sessions,
      sessionsLoading,
      hasMore,
      loadMoreSessions,
      loadingMore,
      currentSessionId,
      startNewChat,
      selectSession
    } = useChat({ disableNavigation: true });
  
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [zoomLevel, setZoomLevel] = useState(100);
    const [focusedBranch, setFocusedBranch] = useState<{
      abilityId?: string;
      skillId?: string;
    } | null>(null);
    const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'resource'>('chat');
    const [loadingNodeId, setLoadingNodeId] = useState<string | null>(null); // For lazy loading indicator
    
    // Management modal state
    const [managementModalOpen, setManagementModalOpen] = useState(false);
    const [managementNode, setManagementNode] = useState<{
      id: string;
      label: string;
      fullName?: string;
      type: string;
      level: number;
      description?: string;
    } | null>(null);
    
    // Tooltip state
    const [hoveredNode, setHoveredNode] = useState<SkillNode | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
    // Handle session selection - stay on SkillTree page (don't redirect to /chat)
    // Handle session selection - stay on SkillTree page (don't redirect to /chat)
    const handleSelectSession = (sessionId: string) => {
      // Manually load session messages since we're not changing URL
      selectSession(sessionId);
      console.log('Session selected:', sessionId);
    };

    // DISABLED: Don't auto-load tree from API on session change
    // This was loading the default template (DevOps) before generated tree arrives
    // Tree will now only come from HTTP streaming after user chats
    // useEffect(() => {
    //   if (currentSessionId) {
    //     loadSessionTree(currentSessionId);
    //   }
    // }, [currentSessionId, loadSessionTree]);

    // Listen for tree-generate event from WebSocket - call HTTP streaming endpoint
    useEffect(() => {
      const handleTreeGenerate = async (event: CustomEvent) => {
        const { sessionId, message } = event.detail;
        if (!sessionId || !message) return;
        
        console.log('🌳 Starting tree generation via HTTP stream...');
        
        // Import gateway and call streaming method
        const { SkillTreeHttpGateway } = await import('../../infrastructure/gateway/SkillTreeHttpGateway');
        const gateway = new SkillTreeHttpGateway();
        
        await gateway.generateTreeStream(
          message,
          sessionId,
          (status, statusMessage) => {
            console.log(`🌳 [Status] ${status}: ${statusMessage}`);
            if (status === 'done') {
              treeNodeService.setLoading(false);
            }
          },
          (nodes) => {
            console.log(`🌳 [Nodes] Received ${nodes.length} nodes`);
            treeNodeService.setNodes(nodes);
          },
          (error) => {
            console.error('🌳 [Error]', error);
            treeNodeService.setLoading(false);
          }
        );
      };
      
      window.addEventListener('tree-generate', handleTreeGenerate as unknown as EventListener);
      return () => window.removeEventListener('tree-generate', handleTreeGenerate as unknown as EventListener);
    }, []);

    // Handle new chat - clear tree and start new session
    const handleNewChat = () => {
      treeNodeService.clear();
      startNewChat();
    };
  
    // Convert tree nodes from Observable to SkillNode format for visualization
    // Build connections from parentId relationships
    const skillNodes: SkillNode[] = useMemo(() => {
      const nodes = treeState.nodes;
      
      // Build a map of parent -> children for connections
      const childrenByParent: Record<string, string[]> = {};
      nodes.forEach(node => {
        const parentId = (node as any).parentId;
        if (parentId) {
          if (!childrenByParent[parentId]) {
            childrenByParent[parentId] = [];
          }
          childrenByParent[parentId].push(node.id);
        }
      });
      
      return nodes.map((node) => ({
        id: node.id,
        label: node.filled 
          ? (node.name.length > 15 ? node.name.substring(0, 12) + '...' : node.name)
          : '?',
        fullName: node.full_name || node.name,
        level: node.level,
        x: 50, // Will be repositioned
        y: 10 + (node.level * 20),
        status: node.filled ? 'available' as const : 'locked' as const,
        // Build connections: either from node.connections or from childrenByParent map
        connections: (node as any).connections || childrenByParent[node.id] || [],
        nodeData: {
          description: node.description,
          difficultyLevel: node.metadata?.difficultyLevel,
          estimatedTimeToComplete: node.metadata?.estimatedHours ? `${node.metadata.estimatedHours} giờ` : undefined,
          filled: node.filled, // Pass filled status for rendering
          learningResources: node.resources, // Pass resources to node details (mapped to learningResources for UI)
        }
      }));
    }, [treeState.nodes]);
  
    // Count filled nodes
    const filledCount = treeState.nodes.filter(n => n.filled).length;
    const totalCount = treeState.nodes.length;
  
    // Convert status to new format
    const getNodeStatus = (node: SkillNode): NodeStatus => {
      if (node.status === 'unlocked') return 'completed';
      if (node.status === 'available') return 'in-progress';
      return 'locked';
    };
  
    // Get visible nodes based on focused branch (PROGRESSIVE REVEAL)
    // Default: show level 0 + 1 only
    // Click level 1 → show its level 2 children
    // Click level 2 → show its level 3 children
    const visibleNodes = useMemo(() => {
      if (!skillNodes || skillNodes.length === 0) return [];
      
      const visible: SkillNode[] = [];
      
      // Always show root (level 0)
      const root = skillNodes.find(n => n.level === 0);
      if (root) visible.push({...root});
      
      // If focused on an ability, ONLY show that ability (hide siblings for cleaner UX)
      if (focusedBranch?.abilityId) {
        const ability = skillNodes.find(n => n.id === focusedBranch.abilityId);
        if (ability) {
          visible.push({...ability});
          
          // If focused on a skill, ONLY show that skill (hide sibling skills)
          if (focusedBranch?.skillId) {
            const skill = skillNodes.find(n => n.id === focusedBranch.skillId);
            if (skill) {
              visible.push({...skill});
              
              // Show level 3 children (knowledge) of focused skill
              if (skill.connections && skill.connections.length > 0) {
                const knowledge = skillNodes.filter(n => 
                  n.level === 3 && skill.connections!.includes(n.id)
                );
                visible.push(...knowledge.map(n => ({...n})));
              }
            }
          } else {
            // No skill focused: show all level 2 skills of the focused ability
            if (ability.connections && ability.connections.length > 0) {
              const skills = skillNodes.filter(n => 
                n.level === 2 && ability.connections!.includes(n.id)
              );
              visible.push(...skills.map(n => ({...n})));
            }
          }
        }
      } else {
        // Multiple nodes - spread evenly across width
        const spacing = 80 / (count + 1); // Use 80% of width with padding
        const startX = 10; // 10% padding from left
        
        nodesAtLevel.forEach((node, idx) => {
          node.x = startX + (spacing * (idx + 1));
        });
      }
    });
    
    return repositioned;
  };

  // Get visible nodes based on focused branch
  const getVisibleNodes = (): SkillNode[] => {
    // Safety check
    if (!skillNodes || skillNodes.length === 0) {
      return [];
    }

    if (!focusedBranch) {
      // Show all level 0 and 1 by default - use original positions
      return skillNodes.filter((node: SkillNode) => node.level <= 1);
    }

    const visible: SkillNode[] = [];
    
    // Always show root
    const root = skillNodes.find(n => n.level === 0);
    if (root) visible.push({...root}); // Clone to avoid mutating original

    if (focusedBranch.skillId) {
      // Focused on a skill - show: root, parent ability, this skill, and its knowledge
      const skill = skillNodes.find(n => n.id === focusedBranch.skillId);
      if (skill) {
        visible.push({...skill});
        
        // Find parent ability: ability's connections contains this skill id
        const parentAbility = skillNodes.find(n => 
          n.level === 1 && n.connections && n.connections.includes(skill.id)
        );
        if (parentAbility) {
          visible.push({...parentAbility});
        }
        
        // Add all knowledge of this skill: skill's connections contains knowledge ids
        if (skill.connections && skill.connections.length > 0) {
          const knowledge = skillNodes.filter(n => 
            n.level === 3 && skill.connections.includes(n.id)
          );
          visible.push(...knowledge.map(n => ({...n})));
        }
      }
    } else if (focusedBranch.abilityId) {
      // Focused on an ability - show: root, this ability, and its skills
      const ability = skillNodes.find(n => n.id === focusedBranch.abilityId);
      if (ability) {
        visible.push({...ability});
        
        // Add all skills of this ability: ability's connections contains skill ids
        if (ability.connections && ability.connections.length > 0) {
          const skills = skillNodes.filter(n => 
            n.level === 2 && ability.connections.includes(n.id)
          );
          visible.push(...skills.map(n => ({...n})));
        }
      }
    }

    // Reposition nodes to spread them out
    const finalVisible = visible.length > 0 ? visible : (root ? [{...root}] : []);
    return repositionVisibleNodes(finalVisible);
  };

  // Handle node click for expand/collapse
  const handleNodeClick = (node: SkillNode) => {
    try {
      setSelectedNode(node);

      if (node.level === 1) {
        // Clicked on ability
        if (focusedBranch?.abilityId === node.id) {
          // Collapse - back to showing all abilities
          setFocusedBranch(null);
        } else {
          // Just expand focus - all nodes already loaded via streaming
          setFocusedBranch({ abilityId: node.id });
        }
      } else if (node.level === 2) {
        // Clicked on skill - expand to show knowledge
        // Find parent ability: ability's connections array contains this skill's id
        const parentAbility = skillNodes.find(n => 
          n.level === 1 && n.connections && n.connections.includes(node.id)
        );
        
        if (focusedBranch?.skillId === node.id) {
          // Collapse skill - back to showing ability's skills
          setFocusedBranch({ abilityId: parentAbility?.id });
        } else {
          // Expand this skill
          setFocusedBranch({ 
            abilityId: parentAbility?.id,
            skillId: node.id 
          });
        }
      } else if (node.level === 3) {
        // Clicked on knowledge - just select it
        // Keep current focus
      } else if (node.level === 0) {
        // Clicked on root - collapse all
        setFocusedBranch(null);
      }
    };
  
    // Handle Manage node button click
    const handleManageClick = (node: SkillNode, event: React.MouseEvent) => {
      event.stopPropagation(); // Prevent node click
      
      setManagementNode({
        id: node.id,
        label: node.label,
        fullName: node.fullName,
        type: node.nodeData?.type || 'node',
        level: node.level,
        description: node.nodeData?.description
      });
      setManagementModalOpen(true);
    };

    const handleCloseManagementModal = () => {
      setManagementModalOpen(false);
      setManagementNode(null);
    };
  
    // Generate bezier path between nodes
    const generatePath = (fromX: number, fromY: number, toX: number, toY: number) => {
      const midY = (fromY + toY) / 2;
      return `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
    };
  
    // Main layout - always show with tree canvas (empty or with data)
    return (
      <div className="flex-1 flex flex-col min-w-0 h-full bg-slate-50">
        {/* Header */}
        <header className="h-14 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-sm">🌳</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800">Skill Tree</h2>
            
            {/* Back button when focused - smart navigation */}
            {focusedBranch?.abilityId && (
              <button 
                onClick={() => {
                  if (focusedBranch.skillId) {
                    // Back from skill to ability view
                    setFocusedBranch({ abilityId: focusedBranch.abilityId });
                  } else {
                    // Back from ability to all abilities
                    setFocusedBranch(null);
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-medium text-slate-600 transition-colors"
              >
                ← {focusedBranch.skillId ? 'Quay lại Skills' : 'Quay lại'}
              </button>
            )}
            
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              filledCount > 0 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-slate-100 text-slate-500'
            }`}>
              {filledCount}/{totalCount} nodes
            </span>
            
            {/* Loading indicator for lazy loading */}
            {(treeState.loading || loadingNodeId) && (
              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                <span className="text-xs text-indigo-600 font-medium">Đang tải...</span>
              </div>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specializations.map((spec) => (
              <button
                key={spec.id}
                onClick={() => selectSpecialization(spec)}
                disabled={loading}
                className="group p-8 rounded-2xl border-2 border-border bg-white hover:border-violet-400 hover:shadow-2xl transition-all duration-300 text-left transform hover:-translate-y-1"
              >
                <div className="mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${spec.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <span className="text-3xl">
                      {spec.icon}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-violet-700">
                  {spec.name}
                </h3>
                
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => handleNodeClick(node)}
                    onMouseEnter={(e) => {
                      setHoveredNode(node);
                      // Calculate tooltip position from SVG coordinates
                      const svg = e.currentTarget.closest('svg');
                      if (svg) {
                        const rect = svg.getBoundingClientRect();
                        const svgWidth = svg.viewBox.baseVal.width;
                        const svgHeight = svg.viewBox.baseVal.height;
                        const scaleX = rect.width / svgWidth;
                        const scaleY = rect.height / svgHeight;
                        setTooltipPosition({
                          x: rect.left + (node.x * scaleX),
                          y: rect.top + (node.y * scaleY)
                        });
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredNode(null);
                    }}
                    className="cursor-pointer"
                    style={{ transition: 'all 0.3s ease' }}
                  >
                    {/* Loading spinner */}
                    {isLoading && (
                      <circle
                        r={radius + 2}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="0.3"
                        strokeDasharray="2,2"
                        className="animate-spin"
                        style={{ transformOrigin: 'center', animation: 'spin 1s linear infinite' }}
                      />
                    )}
                    {/* Placeholder pulse animation */}
                    {!isFilled && (
                      <circle
                        r={radius + 1}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="0.2"
                        opacity="0.3"
                        className="animate-pulse"
                      />
                    )}
  
                    {/* Main node */}
                    <rect
                      x={-radius}
                      y={-radius}
                      width={size}
                      height={size}
                      rx={size * 0.3}
                      fill={isFilled ? '#6366f1' : '#f1f5f9'}
                      stroke={isSelected ? '#6366f1' : isFilled ? 'transparent' : '#cbd5e1'}
                      strokeWidth={isFilled ? '0.3' : '0.2'}
                      strokeDasharray={isFilled ? 'none' : '0.5,0.5'}
                      className="transition-all hover:opacity-90"
                    />
  
                    {/* Node content */}
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isFilled ? 'white' : '#94a3b8'}
                      fontSize={isFilled ? '1.5' : '2'}
                      fontWeight="bold"
                    >
                      {isFilled ? (node.level === 0 ? '🧠' : '✓') : '?'}
                    </text>
  
                    {/* Label */}
                    <text
                      y={radius + 2.5}
                      textAnchor="middle"
                      fill={isFilled ? '#6366f1' : '#94a3b8'}
                      fontSize="1.5"
                      fontWeight={isFilled ? '600' : '400'}
                    >
                      {node.label}
                    </text>
  
                    {/* Active indicator */}
                    {isExpanded && (
                      <text
                        y={radius + 4.5}
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
              </>
            )}
          </div>
  
          {/* Floating Manage Button */}
          {selectedNode && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
              <button
                onClick={(e) => handleManageClick(selectedNode, e)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <Settings className="w-5 h-5" />
                <span className="font-semibold text-lg">Manage Node</span>
              </button>
            </div>
          )}

          {/* Node Management Modal - Replaces SwapNodeModal */}
          {managementNode && (
             <NodeManagementModal
              isOpen={managementModalOpen}
              onClose={handleCloseManagementModal}
              node={managementNode}
              sessionId={currentSessionId || undefined}
              onNodeUpdated={() => {
                  if (currentSessionId) loadSessionTree(currentSessionId);
              }}
              treeNodes={treeState.nodes} // Pass full tree context
            />
          )}

          {/* Node Tooltip */}
          {hoveredNode && (
            <NodeTooltip
              node={hoveredNode}
              position={tooltipPosition}
              progress={hoveredNode.nodeData?.progress}
            />
          )}
  
          {/* Right Panel with Tabs */}
          <RightPanel
            selectedNode={selectedNode}
            getNodeStatus={getNodeStatus}
            messages={messages}
            status={status}
            error={error}
            onClearError={clearError}
            onSend={send}
            sessions={sessions}
            sessionsLoading={sessionsLoading}
            hasMore={hasMore}
            onLoadMore={loadMoreSessions}
            loadingMore={loadingMore}
            currentSessionId={currentSessionId}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
            isCollapsed={rightPanelCollapsed}
            onToggleCollapse={() => setRightPanelCollapsed(!rightPanelCollapsed)}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      ) : (
        // Skill Tree View
        <div className="w-[95%] max-w-[1800px] mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <button
                onClick={backToSelection}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại chọn chuyên ngành
              </button>
              <h1 className="text-2xl font-bold text-foreground mb-2">{selectedSpecialization?.name}</h1>
              <div className="space-y-1">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Cách sử dụng:</strong> Click vào Ability để xem Skills → Click vào Skill để xem Knowledge chi tiết
                </p>
                <p className="text-sm text-muted-foreground">
                  Click lại vào node đang mở để thu gọn. Dùng nút "Thu gọn tất cả" để reset về view ban đầu.
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Tree Visualization */}
            <div className="lg:col-span-3 bg-white rounded-xl border border-border shadow-sm overflow-hidden">
              {/* Controls */}
              <div className="p-4 bg-gray-50 border-b border-border flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">Hiển thị level:</span>
                  {[0, 1, 2, 3].map((level) => (
                    <button
                      key={level}
                      onClick={() => {
                        if (visibleLevels.includes(level)) {
                          setVisibleLevels(visibleLevels.filter(l => l !== level));
                        } else {
                          setVisibleLevels([...visibleLevels, level].sort());
                        }
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        visibleLevels.includes(level)
                          ? 'bg-violet-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {level === 0 ? 'Root' : level === 1 ? 'Ability' : level === 2 ? 'Skill' : 'Knowledge'}
                    </button>
                  ))}
                  <div className="h-4 w-px bg-gray-300 mx-1"></div>
                  <button
                    onClick={() => setVisibleLevels([0, 1, 2, 3])}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-teal-100 text-teal-700 hover:bg-teal-200 transition-colors"
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setVisibleLevels([0])}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                  >
                    Thu gọn
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFocusedBranch(null)}
                    className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    🔄 Thu gọn tất cả
                  </button>
                  
                  <div className="h-4 w-px bg-gray-300"></div>
                  
                  <span className="text-sm font-medium text-foreground">Zoom:</span>
                  <button
                    onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.2))}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    -
                  </button>
                  <span className="text-sm text-muted-foreground w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                  <button
                    onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.2))}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="px-3 py-1 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Reset Zoom
                  </button>
                </div>
              </div>
              
              {/* Info bar */}
              <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-violet-50 border-b border-blue-100 flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center gap-2 text-blue-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    Hiển thị {getVisibleNodes().filter(n => visibleLevels.includes(n.level)).length}/{skillNodes.length} nodes
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-violet-700 font-medium">💡 Click node có dấu <span className="inline-flex items-center justify-center w-4 h-4 bg-green-500 text-white rounded-full text-[10px] font-bold mx-1">+</span> để xem chi tiết</span>
                </div>
              </div>
              
              {/* SVG Canvas */}
              <div className="p-4 overflow-auto h-[calc(100vh-25rem)]">
                <div className="relative w-full h-full" style={{ minWidth: '1200px', minHeight: '900px' }}>
                  <svg 
                    className="w-full h-full" 
                    viewBox="0 0 100 70" 
                    preserveAspectRatio="xMidYMid meet"
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
                  >
                  {/* Gradient definitions */}
                  <defs>
                    {skillNodes.map((node) => (
                      <linearGradient key={`${node.id}-gradient`} id={`${node.id}-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={node.status === 'unlocked' ? '#14b8a6' : node.status === 'available' ? '#8b5cf6' : '#9ca3af'} />
                        <stop offset="100%" stopColor={node.status === 'unlocked' ? '#0891b2' : node.status === 'available' ? '#7c3aed' : '#6b7280'} />
                      </linearGradient>
                    ))}
                  </defs>

                  {/* Connection Lines */}
                  {(() => {
                    const visibleNodes = getVisibleNodes();
                    const visibleNodesMap = new Map(visibleNodes.map(n => [n.id, n]));
                    
                    return visibleNodes
                      .filter(node => visibleLevels.includes(node.level))
                      .flatMap((node) =>
                        node.connections.map((targetId) => {
                          // Find target in repositioned visible nodes, not original skillNodes
                          const target = visibleNodesMap.get(targetId);
                          if (!target || !visibleLevels.includes(target.level)) return null;
                      
                          const isUnlocked = node.status === 'unlocked' && (target.status === 'unlocked' || target.status === 'available');
                          
                          return (
                            <line
                              key={`${node.id}-${targetId}`}
                              x1={node.x}
                              y1={node.y}
                              x2={target.x}
                              y2={target.y}
                              stroke={isUnlocked ? '#8b5cf6' : '#d4d4d8'}
                              strokeWidth="0.3"
                              strokeDasharray={isUnlocked ? '0' : '1,1'}
                              opacity={isUnlocked ? 0.6 : 0.3}
                            />
                          );
                        })
                      );
                  })()}

                  {/* Skill Nodes */}
                  {getVisibleNodes()
                    .filter(node => visibleLevels.includes(node.level))
                    .map((node) => {
                    const Icon = getStatusIcon(node.status);
                    const isSelected = selectedNode?.id === node.id;
                    const hasChildren = node.connections.length > 0;
                    const isExpanded = (node.level === 1 && focusedBranch?.abilityId === node.id) || 
                                      (node.level === 2 && focusedBranch?.skillId === node.id);
                    
                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        onClick={() => handleNodeClick(node)}
                        className="cursor-pointer"
                        style={{ transition: 'all 0.3s' }}
                      >
                        {/* Outer ring for selected */}
                        {isSelected && (
                          <circle
                            r="4"
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth="0.4"
                            opacity="0.5"
                          />
                        )}
                        
                        {/* Node circle */}
                        <circle
                          r="2"
                          fill={`url(#${node.id}-gradient)`}
                          className={`${node.status !== 'locked' ? 'hover:opacity-80' : ''} transition-opacity`}
                        />
                        
                        {/* Expand/Collapse indicator */}
                        {hasChildren && (node.level === 1 || node.level === 2) && (
                          <circle
                            cx="2.5"
                            cy="-2.5"
                            r="1"
                            fill={isExpanded ? '#f59e0b' : '#10b981'}
                            stroke="white"
                            strokeWidth="0.2"
                          />
                        )}
                        
                        {/* Plus/Minus icon */}
                        {hasChildren && (node.level === 1 || node.level === 2) && (
                          <text
                            x="2.5"
                            y="-1.8"
                            textAnchor="middle"
                            className="pointer-events-none select-none"
                            style={{ fontSize: '1.2px', fill: 'white', fontWeight: 'bold' }}
                          >
                            {isExpanded ? '−' : '+'}
                          </text>
                        )}
                        
                        {/* Label */}
                        <text
                          y="4"
                          textAnchor="middle"
                          className="pointer-events-none select-none"
                          style={{ fontSize: '1.8px', fill: '#3f3f46', fontWeight: '500' }}
                        >
                          {node.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                </div>
              </div>
            </div>

            {/* Skill Details Sidebar */}
            <div className="space-y-4 h-[calc(100vh-16rem)] overflow-y-auto">
              {selectedNode ? (
                <div className="bg-white rounded-xl border border-border shadow-lg h-full">
                  {/* Header */}
                  <div className={`p-6 bg-gradient-to-br ${getStatusColor(selectedNode.status)} text-white rounded-t-xl`}>
                    <div className="flex items-center gap-3 mb-2">
                      {(() => {
                        const Icon = getStatusIcon(selectedNode.status);
                        return <Icon className="w-6 h-6" />;
                      })()}
                      <span className="text-sm font-medium uppercase tracking-wide">
                        {selectedNode.nodeData.type}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold">{selectedNode.fullName}</h3>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Description */}
                    {selectedNode.nodeData.description && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-4 h-4 text-violet-600" />
                          <h4 className="font-semibold text-foreground">Mô tả</h4>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedNode.nodeData.description}
                        </p>
                      </div>
                    )}
                    
                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4">
                      {selectedNode.nodeData.difficultyLevel && (
                        <div className="bg-violet-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Target className="w-4 h-4 text-violet-600" />
                            <span className="text-xs font-medium text-violet-900">Độ khó</span>
                          </div>
                          <p className="text-sm font-semibold text-violet-700">
                            {selectedNode.nodeData.difficultyLevel}
                          </p>
                        </div>
                      )}
                      
                      {selectedNode.nodeData.estimatedTimeToComplete && (
                        <div className="bg-teal-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-teal-600" />
                            <span className="text-xs font-medium text-teal-900">Thời gian</span>
                          </div>
                          <p className="text-sm font-semibold text-teal-700">
                            {selectedNode.nodeData.estimatedTimeToComplete}
                          </p>
                        </div>
                      )}
                      
                      {selectedNode.nodeData.importanceScore && (
                        <div className="bg-amber-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Award className="w-4 h-4 text-amber-600" />
                            <span className="text-xs font-medium text-amber-900">Điểm quan trọng</span>
                          </div>
                          <p className="text-sm font-semibold text-amber-700">
                            {selectedNode.nodeData.importanceScore}/10
                          </p>
                        </div>
                      )}
                      
                      {selectedNode.nodeData.marketDemand && (
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-medium text-green-900">Nhu cầu thị trường</span>
                          </div>
                          <p className="text-sm font-semibold text-green-700">
                            {selectedNode.nodeData.marketDemand}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Tools */}
                    {selectedNode.nodeData.tools && selectedNode.nodeData.tools.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Code className="w-4 h-4 text-violet-600" />
                          <h4 className="font-semibold text-foreground">Công cụ</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedNode.nodeData.tools.map((tool: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Keywords */}
                    {selectedNode.nodeData.keywords && selectedNode.nodeData.keywords.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="w-4 h-4 text-violet-600" />
                          <h4 className="font-semibold text-foreground">Từ khóa</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedNode.nodeData.keywords.slice(0, 8).map((keyword: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Learning Resources */}
                    {selectedNode.nodeData.learningResources && selectedNode.nodeData.learningResources.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <ExternalLink className="w-4 h-4 text-violet-600" />
                          <h4 className="font-semibold text-foreground">Tài liệu học tập</h4>
                        </div>
                        <div className="space-y-3">
                          {selectedNode.nodeData.learningResources.map((resource: any, idx: number) => {
                            // Handle both string and object formats
                            const resourceName = typeof resource === 'string' ? resource : (resource.name || resource.title || resource.url || 'Tài liệu học tập');
                            const resourceUrl = typeof resource === 'string' ? resource : (resource.url || '#');
                            
                            return (
                              <LearningResourceManager
                                key={idx}
                                resourceUrl={resourceUrl}
                                resourceName={resourceName}
                                nodeId={selectedNode.id}
                                nodeName={selectedNode.fullName}
                                specializationId={selectedSpecialization?.id || ''}
                                specializationName={selectedSpecialization?.name || ''}
                                estimatedTime={selectedNode.nodeData.estimatedTimeToComplete}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Project Ideas */}
                    {selectedNode.nodeData.projectIdeas && selectedNode.nodeData.projectIdeas.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="w-4 h-4 text-violet-600" />
                          <h4 className="font-semibold text-foreground">Ý tưởng dự án</h4>
                        </div>
                        <ul className="space-y-3">
                          {selectedNode.nodeData.projectIdeas.slice(0, 3).map((idea: any, idx: number) => (
                            <li key={idx} className="pl-4 border-l-2 border-violet-300">
                              {typeof idea === 'string' ? (
                                <p className="text-sm text-muted-foreground">{idea}</p>
                              ) : (
                                <div>
                                  <p className="text-sm font-medium text-foreground mb-1">{idea.title}</p>
                                  <p className="text-xs text-muted-foreground">{idea.description}</p>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="pt-4 space-y-2">
                      {selectedNode.status === 'available' && (
                        <button className="w-full bg-gradient-to-r from-violet-600 to-teal-500 text-white py-3 px-4 rounded-lg hover:opacity-90 transition-opacity font-semibold">
                          Bắt đầu học
                        </button>
                      )}
                      
                      {selectedNode.status === 'unlocked' && (
                        <button className="w-full border-2 border-violet-600 text-violet-600 py-3 px-4 rounded-lg hover:bg-violet-50 transition-colors font-semibold">
                          Ôn tập lại
                        </button>
                      )}
                      
                      {selectedNode.status === 'locked' && (
                        <div className="text-center py-3 text-muted-foreground text-sm">
                          Hoàn thành các kỹ năng trước để mở khóa
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-border p-8 shadow-sm text-center">
                  <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-violet-600" />
                  </div>
                  <p className="text-muted-foreground">
                    Chọn một node để xem chi tiết
                  </p>
                </div>
              )}

              {/* Legend */}
              <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                <h4 className="text-foreground mb-4">Legend</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-teal-400 to-teal-600"></div>
                    <span className="text-muted-foreground">Unlocked</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-400 to-violet-600"></div>
                    <span className="text-muted-foreground">Available</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-300 to-gray-400"></div>
                    <span className="text-muted-foreground">Locked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
