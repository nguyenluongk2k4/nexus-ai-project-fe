import { useState, useEffect, useMemo } from 'react';
import { Check, Lock, Minus, Plus, MessageSquare, Loader2 } from 'lucide-react';
import { useSkillTree, SkillNode } from '@/modules/skill-tree/ui/hooks/useSkillTree';
import { useChat } from '@/modules/chat/ui/hooks/useChat';
import { RightPanel } from '../components/RightPanel';
import { treeState$, TreeNodeData, TreeState, treeNodeService } from '../../domain/services/treeNodeService';

// Node types for different states
type NodeStatus = 'completed' | 'in-progress' | 'locked';

interface TreeNode extends SkillNode {
  progress?: number; // 0-100 for in-progress nodes
}

export function SkillTree() {
  // Subscribe to tree state Observable
  const [treeState, setTreeState] = useState<TreeState>({ nodes: [], loading: false, error: null });
  
    // Destructure loadSessionTree from hook
    const { loadSessionTree } = useSkillTree();

  useEffect(() => {
    const subscription = treeState$.subscribe(setTreeState);
    return () => subscription.unsubscribe();
  }, []);

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
  
    // Handle session selection - stay on SkillTree page (don't redirect to /chat)
    // Handle session selection - stay on SkillTree page (don't redirect to /chat)
    const handleSelectSession = (sessionId: string) => {
      // Manually load session messages since we're not changing URL
      selectSession(sessionId);
      console.log('Session selected:', sessionId);
    };

    // DISABLED: Don't auto-load tree from API on session change
    // This was loading the default template before WS could send generated tree
    // Tree will now only come from WebSocket tree_nodes message
    // useEffect(() => {
    //   if (currentSessionId) {
    //     loadSessionTree(currentSessionId);
    //   }
    // }, [currentSessionId, loadSessionTree]);

    // Listen for tree-updated event from WebSocket (keeping this for debugging)
    useEffect(() => {
      const handleTreeUpdated = (event: CustomEvent) => {
        const { sessionId } = event.detail;
        if (sessionId && currentSessionId === sessionId) {
          console.log('🔄 Tree updated via WS, refetching...');
          loadSessionTree(sessionId);
        }
      };
      
      window.addEventListener('tree-updated', handleTreeUpdated as EventListener);
      return () => window.removeEventListener('tree-updated', handleTreeUpdated as EventListener);
    }, [currentSessionId, loadSessionTree]);

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
        fullName: node.name,
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
        // No focus: show all level 1 (abilities) 
        const abilities = skillNodes.filter(n => n.level === 1);
        visible.push(...abilities.map(n => ({...n})));
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
  
    // Derive selected node from current state (ensures reactivity)
    const selectedNode = useMemo(() => 
      skillNodes.find(n => n.id === selectedNodeId) as TreeNode || null
    , [skillNodes, selectedNodeId]);
  
    const handleNodeClick = async (node: SkillNode) => {
      setSelectedNodeId(node.id);
      setActiveTab('resource'); // Auto-switch to resource tab
  
      if (node.level === 1) {
        if (focusedBranch?.abilityId === node.id) {
          // Toggle off
          setFocusedBranch(null);
        } else {
          // Expand: Set focus and lazy load children
          setFocusedBranch({ abilityId: node.id });
          
          // Check if children already loaded (look for level 2 nodes connected to this node)
          const existingNode = treeState.nodes.find(n => n.id === node.id);
          const hasLoadedChildren = (existingNode as any)?.connections?.length > 0 && 
            treeState.nodes.some(n => n.level === 2 && (existingNode as any)?.connections?.includes(n.id));
          
          if (!hasLoadedChildren) {
            // Set loading state
            setLoadingNodeId(node.id);
            
            try {
              // LAZY LOADING: Call API to fetch children
              const { getSkillTreeService } = await import('../../providers');
              const childData = await getSkillTreeService().getNodeChildren(node.id);
              
              if (childData.nodes.length > 0) {
                // Get direct children IDs (level 2)
                const directChildIds = childData.nodes
                  .filter((n: any) => n.level === 2)
                  .map((n: any) => n.id);
                
                // Convert child nodes
                const newNodes = childData.nodes.map((n: any) => {
                  // Build connections for level 2 nodes (to level 3)
                  const nodeConnections = childData.edges
                    .filter((e: any) => e.source === n.id)
                    .map((e: any) => e.target);
                  
                  return {
                    id: n.id,
                    name: n.label,
                    type: n.type,
                    level: n.level,
                    parentId: n.level === 2 ? node.id : null,
                    filled: true,
                    description: n.data?.description,
                    metadata: n.data,
                    connections: nodeConnections
                  };
                });
                
                // Also update the parent node's connections to include direct children
                const parentUpdate = {
                  id: node.id,
                  connections: directChildIds
                };
                
                // Merge: first add children, then update parent connections
                treeNodeService.updateNodes(newNodes);
                treeNodeService.updateNodeConnections(node.id, directChildIds);
                
                console.log(`🌳 Lazy loaded ${newNodes.length} children for node ${node.id}`);
              }
            } finally {
              setLoadingNodeId(null);
            }
          }
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
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 rounded-full px-3 py-1 gap-2">
              <span className="text-[11px] font-bold text-slate-500">ZOOM</span>
              <button 
                onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                className="p-1 hover:text-indigo-600 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono w-10 text-center font-bold">{zoomLevel}%</span>
              <button 
                onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
                className="p-1 hover:text-indigo-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>
  
        <div className="flex-1 flex overflow-hidden">
          {/* Tree Canvas - shows empty state or tree */}
          <div className="flex-1 relative overflow-hidden">
            {totalCount === 0 ? (
              /* Empty State - shown before first data */
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center max-w-lg px-6">
                  {treeState.loading ? (
                    <>
                      <Loader2 className="w-16 h-16 mx-auto text-indigo-500 animate-spin mb-6" />
                      <h2 className="text-xl font-bold text-slate-700 mb-2">Đang tạo Skill Tree...</h2>
                      <p className="text-slate-500">AI đang phân tích và chọn lộ trình phù hợp</p>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                        <span className="text-4xl">🌳</span>
                      </div>
                      <h2 className="text-2xl font-bold text-slate-800 mb-3">Skill Tree</h2>
                      <p className="text-slate-500 mb-6 leading-relaxed">
                        Sử dụng chat bên phải để hỏi về lộ trình học tập.<br/>
                        AI sẽ tự động tạo skill tree phù hợp với bạn.
                      </p>
                      
                      <div className="flex items-center gap-2 justify-center text-indigo-500">
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-sm font-medium">Chat để bắt đầu</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* Tree Visualization - shown after first data */
              <>
                {/* Legend */}
                <div className="absolute top-6 left-8 flex items-center gap-6 bg-white/90 backdrop-blur p-4 rounded-xl border border-slate-200 shadow-sm z-20">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-lg bg-indigo-500"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Node</span>
                  </div>
                  <span className="text-xs text-slate-400">{totalCount} nodes</span>
                </div>
  
            {/* SVG Tree - Always visible (skeleton or filled) */}
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
                  
                  const isFilled = node.nodeData?.filled;
                  
                  return (
                    <path
                      key={`${node.id}-${targetId}`}
                      d={generatePath(node.x, node.y, target.x, target.y)}
                      fill="none"
                      stroke={isFilled ? '#6366f1' : '#cbd5e1'}
                      strokeWidth="0.4"
                      strokeLinecap="round"
                      strokeDasharray={isFilled ? 'none' : '1,1'}
                      opacity={isFilled ? 0.6 : 0.3}
                    />
                  );
                });
              })}
  
              {/* Nodes */}
              {repositionedNodes.map((node) => {
                const isFilled = node.nodeData?.filled;
                const isSelected = selectedNode?.id === node.id;
                const isExpanded = (node.level === 1 && focusedBranch?.abilityId === node.id) || 
                                  (node.level === 2 && focusedBranch?.skillId === node.id);
                const isLoading = loadingNodeId === node.id; // Loading indicator
                
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
      </div>
    );
  }
