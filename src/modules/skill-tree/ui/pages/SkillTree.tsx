import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Lock, Minus, Plus, MessageSquare, Loader2, Save, CheckCircle, BookOpen } from 'lucide-react';
import { useSkillTree, SkillNode } from '@/modules/skill-tree/ui/hooks/useSkillTree';
import { useChat } from '@/modules/chat/ui/hooks/useChat';
import { RightPanel } from '../components/RightPanel';
import { NodeManagementModal } from '../components/NodeManagementModal';
import { NodeTooltip } from '../components/NodeTooltip';
import { treeState$, TreeNodeData, TreeState, treeNodeService } from '../../domain/services/treeNodeService';
import { skillTreeGateway } from '../../providers';
import { Settings } from 'lucide-react';
import { useAuth } from '@/modules/auth/AuthProvider';
const logo = '/logo.png';
// Node types for different states
type NodeStatus = 'completed' | 'in-progress' | 'locked';

interface TreeNode extends SkillNode {
  progress?: number; // 0-100 for in-progress nodes
}

export function SkillTree() {
  const { user } = useAuth();
  // Subscribe to tree state Observable
  const [treeState, setTreeState] = useState<TreeState>({ nodes: [], loading: false, error: null });
  const { t } = useTranslation();

  // Destructure hook values
  const {
    skillNodes: initialNodes,
    selectedSpecialization,
    selectSpecialization,
    loadSessionTree,
    showTree,
    generateTree,
    backToSelection
  } = useSkillTree();

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
    selectSession,
    uploadFile,
    attachments,
    isUploading,
    removeAttachment
  } = useChat({ disableNavigation: true });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [focusedBranch, setFocusedBranch] = useState<{
    abilityId?: string;
    skillId?: string;
  } | null>(null);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'resource'>('chat');

  // Management modal state
  const [managementModalOpen, setManagementModalOpen] = useState(false);
  const [managementNode, setManagementNode] = useState<{
    id: string;
    label: string;
    fullName?: string;
    type: string;
    level: number;
    description?: string;
    icon?: string;
  } | null>(null);

  // Tooltip state
  const [hoveredNode, setHoveredNode] = useState<SkillNode | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Save to My Tree state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handle session selection - stay on SkillTree page (don't redirect to /chat)
  // Handle session selection - stay on SkillTree page (don't redirect to /chat)
  const handleSelectSession = (sessionId: string) => {
    // Manually load session messages since we're not changing URL
    selectSession(sessionId);
    loadSessionTree(sessionId); // Load tree for history sessions
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

  // Listen for trigger-tree-stream event from WebSocket (HTTP Streaming trigger)
  useEffect(() => {
    const handleTriggerStream = async (event: CustomEvent) => {
      const { sessionId, message } = event.detail;
      if (sessionId && message) {
        console.log('🚀 HTTP Streaming triggered for tree generation');
        // Flag already set in ChatWsGateway
        try {
          await generateTree(message, sessionId);
        } finally {
          // Reset flag after streaming completes
          (window as any).__treeStreamingActive = false;
          console.log('🏁 HTTP Streaming completed, flag reset');
        }
      }
    };

    window.addEventListener('trigger-tree-stream', handleTriggerStream as unknown as EventListener);
    return () => window.removeEventListener('trigger-tree-stream', handleTriggerStream as unknown as EventListener);
  }, [generateTree]);

  // Handle new chat - clear tree and start new session
  const handleNewChat = () => {
    treeNodeService.clear();
    startNewChat();
    setSaveSuccess(false); // Reset save status for new chat
  };

  // Handle Save to My Tree
  const handleSaveToMyTree = async () => {
    if (!currentSessionId || treeState.nodes.length === 0) return;

    setIsSaving(true);
    try {
      const nodeIds = treeState.nodes.map(n => n.id);
      await skillTreeGateway.saveToMyTree(currentSessionId, nodeIds);
      setSaveSuccess(true);
      // Reset success after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save to My Tree:', error);
      // Could add error toast here
    } finally {
      setIsSaving(false);
    }
  };

  // Convert tree nodes from Observable to SkillNode format for visualization
  // Build connections from parentId relationships
  const skillNodes: SkillNode[] = useMemo(() => {
    if (!showTree) return [];

    // 1. Prioritize nodes from service (Session Tree)
    if (treeState.nodes.length > 0) {
      const nodes = treeState.nodes;

      // Build map for connections
      const childrenByParent: Record<string, string[]> = {};
      nodes.forEach(node => {
        const parentId = (node as any).parentId;
        if (parentId) {
          if (!childrenByParent[parentId]) childrenByParent[parentId] = [];
          childrenByParent[parentId].push(node.id);
        }
      });

      return nodes.map((node) => ({
        id: node.id,
        label: node.filled
          ? (node.name.length > 15 ? node.name.substring(0, 12) + '...' : node.name)
          : '?',
        fullName: node.name,
        type: node.type,
        level: node.level,
        originalNodeId: node.originalNodeId, // NEW: Preserve original mapping
        icon: node.icon, // NEW: Map icon from service
        x: 50, // Default for session nodes (repositioned later)
        y: 10 + (node.level * 20),
        status: ((node.metadata as any)?.status === 'completed' || (node.metadata as any)?.status === 'unlocked')
          ? 'unlocked' as const
          : (node.filled ? 'available' as const : 'locked' as const),
        connections: childrenByParent[node.id] || (node as any).connections || [],
        nodeData: {
          description: node.description,
          difficultyLevel: node.metadata?.difficultyLevel,
          estimatedTimeToComplete: node.metadata?.estimatedHours ? `${node.metadata.estimatedHours} giờ` : undefined,
          filled: node.filled,
          learningResources: node.resources,
        }
      }));
    }

    // 2. Fallback to initialNodes (Mock Data / 2-4-8 Layout)
    return initialNodes.map((node) => ({
      id: node.id,
      label: node.label,
      fullName: node.fullName || node.label,
      type: node.type || 'skill',
      level: node.level,
      icon: node.icon,
      x: node.x, // Preserve Mock Layout position
      y: node.y,
      status: node.status,
      connections: node.connections || [],
      nodeData: node.nodeData
    }));
  }, [treeState.nodes, initialNodes, showTree]);

  // Count filled nodes
  const filledCount = treeState.nodes.filter(n => n.filled).length;
  const totalCount = treeState.nodes.length;

  // Convert status to new format
  const getNodeStatus = (node: SkillNode): NodeStatus => {
    if (node.status === 'unlocked') return 'completed';
    if (node.status === 'available') return 'in-progress';
    return 'locked';
  };

  // Get visible nodes - Progressive reveal with focus mode
  const visibleNodes = useMemo(() => {
    if (!skillNodes || skillNodes.length === 0) return [];

    // If we have session data (generated tree), use progressive reveal with focus
    if (treeState.nodes.length > 0) {
      const visible: SkillNode[] = [];

      // Always show root (level 0)
      const root = skillNodes.find(n => n.level === 0);
      if (root) visible.push({ ...root });

      // Level 1 (Abilities) - focus mode
      const abilities = skillNodes.filter(n => n.level === 1);

      if (focusedBranch?.abilityId) {
        // FOCUS MODE: Only show the focused ability, hide siblings
        const focusedAbility = abilities.find(a => a.id === focusedBranch.abilityId);
        if (focusedAbility) {
          visible.push({ ...focusedAbility });

          // Show its level 2 children (skills)
          if (focusedAbility.connections && focusedAbility.connections.length > 0) {
            const skills = skillNodes.filter(n =>
              n.level === 2 && focusedAbility.connections!.includes(n.id)
            );

            if (focusedBranch?.skillId) {
              // FOCUS MODE: Only show the focused skill, hide siblings
              const focusedSkill = skills.find(s => s.id === focusedBranch.skillId);
              if (focusedSkill) {
                visible.push({ ...focusedSkill });

                // Show its level 3 children (knowledge)
                if (focusedSkill.connections && focusedSkill.connections.length > 0) {
                  const knowledge = skillNodes.filter(n =>
                    n.level === 3 && focusedSkill.connections!.includes(n.id)
                  );
                  console.log('👁️ [SkillTree] Focus mode - Root + Ability + Skill + Knowledge:', visible.length + knowledge.length);
                  visible.push(...knowledge.map(n => ({ ...n })));
                }
              }
            } else {
              // Show ALL skills of focused ability
              console.log('👁️ [SkillTree] Focus mode - Root + Ability + Skills:', visible.length + skills.length);
              visible.push(...skills.map(n => ({ ...n })));
            }
          }
        }
      } else {
        // NO FOCUS: Show ALL abilities
        visible.push(...abilities.map(n => ({ ...n })));
      }

      return visible;
    }

    // For mock data, use existing progressive reveal logic
    const visible: SkillNode[] = [];

    // Always show root (level 0)
    const root = skillNodes.find(n => n.level === 0);
    if (root) visible.push({ ...root });

    // If focused on an ability, show that branch
    if (focusedBranch?.abilityId) {
      const ability = skillNodes.find(n => n.id === focusedBranch.abilityId);
      if (ability) {
        visible.push({ ...ability });

        if (focusedBranch?.skillId) {
          const skill = skillNodes.find(n => n.id === focusedBranch.skillId);
          if (skill) {
            visible.push({ ...skill });
            if (skill.connections && skill.connections.length > 0) {
              const knowledge = skillNodes.filter(n =>
                n.level === 3 && skill.connections!.includes(n.id)
              );
              visible.push(...knowledge.map(n => ({ ...n })));
            }
          }
        } else {
          if (ability.connections && ability.connections.length > 0) {
            const skills = skillNodes.filter(n =>
              n.level === 2 && ability.connections!.includes(n.id)
            );
            visible.push(...skills.map(n => ({ ...n })));
          }
        }
      }
    } else {
      // No focus: show all level 1 (abilities) 
      const abilities = skillNodes.filter(n => n.level === 1);
      visible.push(...abilities.map(n => ({ ...n })));
    }

    return visible;
  }, [skillNodes, focusedBranch, treeState.nodes.length]);

  // Reposition nodes for pyramid display with dynamic centering
  const repositionedNodes = useMemo(() => {
    const nodes = visibleNodes.map(n => ({ ...n }));
    if (nodes.length === 0) return [];

    // Group nodes by level
    const byLevel: Record<number, SkillNode[]> = {};
    nodes.forEach(node => {
      if (!byLevel[node.level]) byLevel[node.level] = [];
      byLevel[node.level].push(node);
    });

    // Y positions for pyramid (percentage of viewBox height 0-80)
    const levelY: Record<number, number> = {
      0: 10,   // Root at top
      1: 28,   // Abilities
      2: 50,   // Skills
      3: 72    // Knowledge at bottom
    };

    // Calculate X positions for each level with smart centering
    Object.keys(byLevel).forEach(levelStr => {
      const level = parseInt(levelStr);
      const nodesAtLevel = byLevel[level];
      const count = nodesAtLevel.length;

      // Set Y position based on level
      nodesAtLevel.forEach(node => {
        node.y = levelY[level] || (10 + level * 20);
      });

      // Set X position with dynamic spacing and centering
      if (count === 1) {
        // Single node: center it
        nodesAtLevel[0].x = 50;
      } else if (count === 2) {
        // Two nodes: symmetric around center
        nodesAtLevel[0].x = 35;
        nodesAtLevel[1].x = 65;
      } else if (count === 3) {
        // Three nodes: one center, two sides
        nodesAtLevel[0].x = 25;
        nodesAtLevel[1].x = 50;
        nodesAtLevel[2].x = 75;
      } else {
        // Many nodes: distribute evenly with padding
        const totalWidth = 70; // Use 70% of viewport width
        const startX = (100 - totalWidth) / 2; // Center the distribution
        const spacing = totalWidth / (count - 1 || 1);

        nodesAtLevel.forEach((node, idx) => {
          node.x = startX + (spacing * idx);
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
    setRightPanelCollapsed(false); // Ensure Right Panel is open (especially on mobile)

    if (node.level === 1) {
      // Level 1 (Ability): Toggle expand to show/hide level 2 children (skills)
      if (focusedBranch?.abilityId === node.id) {
        // Collapse: Hide children
        setFocusedBranch(null);
      } else {
        // Expand: Show level 2 children
        setFocusedBranch({ abilityId: node.id });
      }
    } else if (node.level === 2) {
      // Level 2 (Skill): Toggle expand to show/hide level 3 children (knowledge)
      const parentAbility = skillNodes.find(n =>
        n.level === 1 && n.connections?.includes(node.id)
      );
      if (focusedBranch?.skillId === node.id) {
        // Collapse: Go back to showing only skills
        setFocusedBranch({ abilityId: parentAbility?.id });
      } else {
        // Expand: Show level 3 children
        setFocusedBranch({ abilityId: parentAbility?.id, skillId: node.id });
      }
    } else if (node.level === 0) {
      // Root: Collapse all
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
      type: node.type || 'skill', // Use type from node or default
      level: node.level,
      description: node.nodeData?.description,
      icon: node.icon,
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

  const handleChatSend = async (message: string) => {
    // Chỉ cần gọi send() - WebSocket sẽ trigger tree_generating event
    // Event listener sẽ tự động gọi HTTP streaming (generateTree)
    // KHÔNG gọi generateTree trực tiếp ở đây để tránh duplicate
    send(message);

    // Flow: send() → WS → backend → tree_generating → trigger-tree-stream event → generateTree()
  };

  // Main layout - always show with tree canvas (empty or with data)
  return (
    <div className="flex-1 flex flex-col min-w-0 h-full bg-white">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes nodePopIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes pathDraw {
          0% { stroke-dashoffset: 100; opacity: 0; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        
        .node-animate {
          animation: nodePopIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        
        .path-animate {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: pathDraw 0.8s ease-out 0.4s forwards;
        }
      `}} />
      <div className="flex-1 flex overflow-hidden relative md:static">
        {/* Left Content Area: Canvas + Footer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tree Canvas - shows empty state or tree */}
          <div className="flex-1 relative overflow-hidden flex flex-col">
            {totalCount === 0 ? (
              /* Empty State - shown before first data */
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="text-center max-w-lg w-full">
                  {treeState.loading ? (
                    <>
                      <Loader2 className="w-12 h-12 md:w-16 md:h-16 mx-auto text-indigo-500 animate-spin mb-4 md:mb-6" />
                      <h2 className="text-lg md:text-xl font-bold text-slate-700 mb-2">{t('skillTree.page.creatingTree')}</h2>
                      <p className="text-sm md:text-base text-slate-500">{t('skillTree.page.analyzing')}</p>
                    </>
                  ) : (
                    <>
                      <div className="h-20 md:h-20 mx-auto flex items-center justify-center mb-4 md:mb-6">
                        <img src={logo} alt="Nexus AI" className="h-10 md:h-16" />
                      </div>
                      <p className="text-sm md:text-base text-slate-500 mb-4 md:mb-6 leading-relaxed">
                        {t('skillTree.page.instruction1')}<br className="hidden md:block" />
                        {t('skillTree.page.instruction2')}
                      </p>

                      <div className="flex items-center gap-2 justify-center text-indigo-500">
                        <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="text-xs md:text-sm font-medium">{t('skillTree.page.chatToStart')}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* Tree Visualization - shown after first data */
              <>
                {/* Floating Manage Button - moved inside relative canvas container to stay above footer */}
                {selectedNode && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
                    <button
                      onClick={(e) => handleManageClick(selectedNode, e)}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 text-white rounded-full shadow-lg transition-transform hover:scale-105 font-semibold"
                    >
                      <Settings className="w-5 h-5" />
                      <span>{t('skillTree.manageNode')}</span>
                    </button>
                  </div>
                )}

                {/* Legend - Hide on small mobile */}
                <div className="absolute top-2 left-2 md:top-6 md:left-8 flex items-center gap-2 md:gap-6 bg-white/90 backdrop-blur p-2 md:p-4 rounded-xl border border-slate-200 shadow-sm z-20 hidden sm:flex">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 rounded-lg bg-indigo-500"></div>
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-tight">{t('skillTree.page.nodeLegend')}</span>
                  </div>
                  <span className="text-[10px] md:text-xs text-slate-400">{totalCount} {t('skillTree.page.nodesCount')}</span>
                </div>

                {/* SVG Tree - Always visible (skeleton or filled) */}
                <svg
                  className="w-full h-full"
                  viewBox="0 0 100 80"
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
                >
                  {/* Connection Paths - Draw from parent to children */}
                  {(() => {
                    const nodeMap = new Map(repositionedNodes.map(n => [n.id, n]));
                    return repositionedNodes.map((node) =>
                      node.connections?.map((targetId) => {
                        const target = nodeMap.get(targetId);
                        if (!target) return null;

                        const isTargetActive = (node.level === 0 && focusedBranch?.abilityId === targetId) ||
                          (node.level === 1 && focusedBranch?.abilityId === node.id) ||
                          (node.level === 2 && focusedBranch?.skillId === node.id);

                        return (
                          <g key={`${node.id}-${targetId}`}>
                            {/* Connection Line */}
                            <path
                              d={generatePath(node.x, node.y, target.x, target.y)}
                              fill="none"
                              stroke={"#818cf8"}
                              strokeWidth={isTargetActive ? "0.4" : "0.2"}
                              strokeLinecap="round"
                              opacity={isTargetActive ? 1 : 0.6}
                              className="path-animate"
                            />
                          </g>
                        );
                      })
                    );
                  })()}

                  {/* Nodes */}
                  {repositionedNodes.map((node) => {
                    const isFilled = node.nodeData?.filled;
                    const isSelected = selectedNode?.id === node.id;
                    const isExpanded = (node.level === 1 && focusedBranch?.abilityId === node.id) ||
                      (node.level === 2 && focusedBranch?.skillId === node.id);

                    // Node sizes based on level (hierarchical: higher level => larger size)
                    const size = node.level === 0 ? 8 :
                      node.level === 1 ? 7 :
                        node.level === 2 ? 6 : 5;
                    const radius = size / 2;

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        onClick={() => handleNodeClick(node)}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredNode(node);
                          setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top });
                        }}
                        onMouseLeave={() => setHoveredNode(null)}
                        className="cursor-pointer node-animate"
                        style={{ transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                      >
                        {/* LEVEL 0: ROOT (Avatar with Pulse) */}
                        {node.level === 0 && (
                          <g>
                            {/* Pulse Rings */}
                            <circle r={radius + 3} fill="none" stroke="#6366f1" strokeWidth="0.1" opacity="0.2" className="animate-ping" style={{ animationDuration: '3s' }} />
                            <circle r={radius + 1.5} fill="none" stroke="#6366f1" strokeWidth="0.2" opacity="0.5" />

                            {/* Main Avatar Circle */}
                            <circle
                              r={radius}
                              fill="white"
                              stroke="#818cf8"
                              strokeWidth="0.4"
                              filter="url(#subtleShadow)"
                            />

                            {/* Avatar Image */}
                            <image
                              href={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || 'User')}&background=random`}
                              x={-radius * 0.9}
                              y={-radius * 0.9}
                              width={size * 0.9}
                              height={size * 0.9}
                              clipPath="url(#avatarClip)"
                            />
                          </g>
                        )}

                        {/* LEVEL 1: ABILITY (Circular instead of distinct card) */}
                        {node.level === 1 && (
                          <g>
                            {/* Outer Glow Ring for Abilities */}
                            <circle
                              r={radius + 0.3}
                              fill="none"
                              stroke={isExpanded ? "#818cf8" : "#c7d2fe"}
                              strokeWidth="0.15"
                              opacity="0.5"
                            />

                            {/* Main Circle Background */}
                            <circle
                              r={radius}
                              fill="white"
                              stroke={isExpanded ? "#818cf8" : "#c7d2fe"}
                              strokeWidth="0.3"
                              filter="url(#subtleShadow)"
                            />

                            {/* Icon or Symbol */}
                            {node.icon ? (
                              <image
                                href={node.icon}
                                x={-radius * 0.6}
                                y={-radius * 0.6}
                                width={size * 0.6}
                                height={size * 0.6}
                                preserveAspectRatio="xMidYMid meet"
                              />
                            ) : (
                              <text textAnchor="middle" dominantBaseline="middle" fill="#6366f1" fontSize="2" fontWeight="bold">
                                {node.label.charAt(0)}
                              </text>
                            )}
                          </g>
                        )}

                        {/* LEVEL 2: SKILL (Circular Progress) */}
                        {
                          node.level === 2 && (
                            <g>
                              {/* Outer Glow */}
                              {isFilled && <circle r={radius + 0.5} fill="#6366f1" opacity="0.1" filter="url(#blurFilter)" />}

                              {/* Progress Ring Background */}
                              <circle r={radius} fill="white" stroke="#e2e8f0" strokeWidth="0.2" filter="url(#subtleShadow)" />

                              {/* Icon */}
                              {node.icon ? (
                                <image
                                  href={node.icon}
                                  x={-radius * 0.6}
                                  y={-radius * 0.6}
                                  width={size * 0.6}
                                  height={size * 0.6}
                                  clipPath="circle(40% at 50% 50%)"
                                />
                              ) : (
                                <text textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize="1.5">⚡</text>
                              )}

                              {/* Active/Filled Border */}
                              {isFilled && (
                                <circle
                                  r={radius}
                                  fill="none"
                                  stroke={isSelected ? "#a5b4fc" : "#6366f1"}
                                  strokeWidth="0.3"
                                  strokeDasharray={`${radius * 4} ${radius * 2}`} // Dash effect
                                  className="animate-spin-slow"
                                  style={{ transformOrigin: 'center', animationDuration: '20s' }}
                                />
                              )}
                            </g>
                          )
                        }

                        {/* LEVEL 3: KNOWLEDGE (Satellite) */}
                        {
                          node.level === 3 && (
                            <g>
                              <circle
                                r={radius}
                                fill="white"
                                stroke={isFilled ? "#818cf8" : "#e2e8f0"}
                                strokeWidth="0.2"
                                filter="url(#subtleShadow)"
                              />
                              {node.icon ? (
                                <image
                                  href={node.icon}
                                  x={-radius * 0.6}
                                  y={-radius * 0.6}
                                  width={size * 0.6}
                                  height={size * 0.6}
                                />
                              ) : (
                                <circle r={0.5} fill={isFilled ? "#818cf8" : "#cbd5e1"} />
                              )}
                            </g>
                          )
                        }

                        {/* Label - Reduced font size and centered position */}
                        <foreignObject x={-10} y={radius + 1.2} width={20} height={10}>
                          <div className={`text-center text-[2.0px] font-medium leading-tight ${isSelected ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}>
                            {node.label}
                          </div>
                        </foreignObject>


                      </g>
                    );
                  })}

                  {/* Gradient definitions */}
                  <defs>
                    <clipPath id="avatarClip">
                      <circle cx="0" cy="0" r="2.4" />
                    </clipPath>

                    {/* Subtle Drop Shadow */}
                    <filter id="subtleShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="0.2" result="blur" />
                      <feOffset in="blur" dx="0.1" dy="0.1" result="offsetBlur" />
                      <feFlood floodColor="#cbd5e1" floodOpacity="0.4" result="offsetColor" />
                      <feComposite in="offsetColor" in2="offsetBlur" operator="in" />
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>

                    <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f8fafc" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>

                    <filter id="blurFilter">
                      <feGaussianBlur stdDeviation="0.4" />
                    </filter>
                  </defs>
                </svg>
              </>
            )}
          </div>

          {/* Bottom Control Bar - explicit height and structure to match ChatTab exactly */}
          <footer className="h-[64px] border-t border-slate-200 bg-white flex flex-col justify-center z-30 flex-shrink-0">
            <div className="px-4 flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-2xl border border-slate-200">
                  <span className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-wider">
                    {filledCount}/{totalCount} {t('skillTree.page.nodes')}
                  </span>
                  {treeState.loading && <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />}
                </div>

                {focusedBranch?.abilityId && (
                  <button
                    onClick={() => {
                      if (focusedBranch.skillId) {
                        setFocusedBranch({ abilityId: focusedBranch.abilityId });
                      } else {
                        setFocusedBranch(null);
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-[10px] md:text-xs font-bold text-slate-700 shadow-sm transition-all"
                  >
                    <div className="w-5 h-5 flex items-center justify-center bg-slate-100 rounded-lg text-indigo-600 font-black">←</div>
                    <span className="hidden sm:inline">{focusedBranch.skillId ? t('skillTree.page.backToSkills') : t('skillTree.page.back')}</span>
                    <span className="sm:hidden">{t('skillTree.page.back')}</span>
                  </button>
                )}
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-2 py-1 gap-1 md:gap-3 shadow-sm">
                <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))} className="p-1 hover:text-indigo-600 transition-colors text-slate-400"><Minus className="w-4 h-4" /></button>
                <span className="text-xs font-black w-8 md:w-10 text-center text-slate-700">{zoomLevel}%</span>
                <button onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))} className="p-1 hover:text-indigo-600 transition-colors text-slate-400"><Plus className="w-4 h-4" /></button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                  className="md:hidden p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100"
                >
                  {activeTab === 'resource' ? <BookOpen className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                </button>

                {treeState.nodes.length > 0 && currentSessionId && (
                  <button
                    onClick={handleSaveToMyTree}
                    disabled={isSaving || saveSuccess}
                    className={`flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-wider transition-all shadow-lg ${saveSuccess ? 'bg-green-500 text-white shadow-green-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                      }`}
                  >
                    {saveSuccess ? <CheckCircle className="w-4 h-4" /> : isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span className="hidden sm:inline">
                      {saveSuccess ? t('skillTree.page.saved') : isSaving ? t('skillTree.page.saving') : t('skillTree.page.saveToMyTree')}
                    </span>
                    <span className="sm:hidden">{t('skillTree.button.save')}</span>
                  </button>
                )}
              </div>
            </div>
          </footer>
        </div>

        {/* Right Panel with Tabs */}
        <RightPanel
          selectedNode={selectedNode}
          getNodeStatus={getNodeStatus}
          messages={messages}
          status={status}
          error={error}
          onClearError={clearError}
          onSend={handleChatSend}
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
          uploadFile={uploadFile}
          attachments={attachments}
          isUploading={isUploading}
          removeAttachment={removeAttachment}
        />
      </div >

      {/* Node Management Modal */}
      {
        managementNode && (
          <NodeManagementModal
            isOpen={managementModalOpen}
            onClose={handleCloseManagementModal}
            node={managementNode}
            sessionId={currentSessionId || undefined}
            onNodeUpdated={() => {
              if (currentSessionId) {
                loadSessionTree(currentSessionId);
              }
            }}
            treeNodes={treeState.nodes}
          />
        )
      }

      {/* Tooltip */}
      {
        hoveredNode && (
          <NodeTooltip
            node={hoveredNode}
            position={tooltipPosition}
            progress={hoveredNode.nodeData?.progress}
          />
        )
      }
    </div >
  );
}
