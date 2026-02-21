import React, { useState, useEffect, useMemo } from 'react';
import { GitBranch, Loader2, TreeDeciduous, Plus, Minus, BookOpen, Brain, Star, Layers, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { skillTreeGateway } from '../../providers';
import { useAuth } from '@/modules/auth/AuthProvider';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PageLoading } from '@/shared/components/PageLoading';
import { RightPanel } from '../components/RightPanel';
import { useChat } from '@/modules/chat/ui/hooks/useChat';

// Types for user's skill tree
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
  original_node_id?: string;
}

interface UserSkillTree {
  id: string;
  name: string;
  nodes: UserSkillNode[];
  edges: { source: string; target: string }[];
}

type FilterTab = 'all' | 'knowledge' | 'skills' | 'abilities';

const animationStyles = `
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
`;

export function MySkillTree() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tree, setTree] = useState<UserSkillTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [focusedRootId, setFocusedRootId] = useState<string | null>(null); // Track focused root (Backend/Frontend)
  const [focusedBranch, setFocusedBranch] = useState<{ abilityId?: string; skillId?: string } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'resource'>('resource');
  const [isVisible, setIsVisible] = useState(false);

  // Set visible after short delay to prevent vertical flash
  useEffect(() => {
    if (!loading && tree) {
      const timer = setTimeout(() => setIsVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, [loading, tree]);

  // Dummy chat hook for RightPanel compatibility (MyTree doesn't use chat session)
  const chatProps = useChat({ disableNavigation: true });

  // Camera Y offset (SVG pixels)
  const cameraOffset = useMemo(() => {
    const isMobile = window.innerWidth < 768;
    if (focusedBranch?.skillId) return isMobile ? 50 : 30; // Shift tree down to see top better
    if (focusedBranch?.abilityId) return isMobile ? 25 : 15;
    return 0;
  }, [focusedBranch]);

  useEffect(() => {
    loadMyTree();
  }, []);

  const loadMyTree = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await skillTreeGateway.getMyTree();
      setTree(data);
    } catch (e) {
      const errMsg = t('mySkillTree.toasts.loadError');
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Get node color based on level (blue theme)
  const getNodeColor = (level: number, status: string) => {
    if (status === 'completed') return { bg: '#10b981', border: '#059669' };
    if (status === 'in_progress') return { bg: '#f59e0b', border: '#d97706' };

    switch (level) {
      case 0: return { bg: '#6366f1', border: '#4f46e5' }; // indigo - root
      case 1: return { bg: '#8b5cf6', border: '#7c3aed' }; // purple - abilities
      case 2: return { bg: '#06b6d4', border: '#0891b2' }; // cyan - skills
      default: return { bg: '#a855f7', border: '#9333ea' }; // violet - knowledge
    }
  };

  // Generate smooth organic S-curves for branches
  const generatePath = (fromX: number, fromY: number, toX: number, toY: number) => {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Stronger vertical control for smoother curves
    const controlY1 = fromY + dy * 0.6;
    const controlY2 = toY - dy * 0.4;

    // Horizontal spread based on distance
    const spreadFactor = Math.min(Math.abs(dx) * 0.5, dist * 0.3);
    const controlX1 = fromX + (dx > 0 ? spreadFactor : -spreadFactor) * 0.3;
    const controlX2 = toX - (dx > 0 ? spreadFactor : -spreadFactor) * 0.3;

    return `M ${fromX} ${fromY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toX} ${toY}`;
  };

  // Central Trunk path helper
  const generateTrunkPath = (fromX: number, fromY: number, toX: number, toY: number) => {
    return generatePath(fromX, fromY, toX, toY);
  };

  // Build maps for efficient graph traversal
  const { childrenByParent, parentByChild } = useMemo(() => {
    if (!tree || !Array.isArray(tree.edges)) return { childrenByParent: {}, parentByChild: {} };

    const children: Record<string, string[]> = {};
    const parents: Record<string, string> = {};

    tree.edges.forEach(edge => {
      if (!edge.source || !edge.target) return;
      // Children map
      if (!children[edge.source]) children[edge.source] = [];
      children[edge.source].push(edge.target);

      // Parent map (assuming tree structure with single parent)
      parents[edge.target] = edge.source;
    });

    return { childrenByParent: children, parentByChild: parents };
  }, [tree]);

  // Handle node click with robust focus/expand logic
  const handleNodeClick = (node: UserSkillNode & { x: number; y: number }, e: React.MouseEvent) => {
    e.stopPropagation();
    // 1. Basic selection for Right Panel
    setSelectedNodeId(node.id);
    setActiveTab('resource');

    // Auto-open panel only on desktop/tablet to allow tree climbing on mobile
    if (window.innerWidth >= 768) {
      setRightPanelCollapsed(false);
    }

    // 2. Focus Logic
    if (node.level === 0) {
      // --- ROOT CLICK ---
      if (focusedRootId === node.id) {
        console.log('   Action: Unfocus Root');
        setFocusedRootId(null);
        setFocusedBranch(null);
      } else {
        console.log('   Action: Focus Root');
        setFocusedRootId(node.id);
        setFocusedBranch(null);
      }
    } else if (node.level === 1) {
      // --- ABILITY CLICK ---
      const parentId = parentByChild[node.id];

      if (focusedBranch?.abilityId === node.id) {
        if (focusedBranch.skillId) {
          setFocusedBranch({ abilityId: node.id });
        } else {
          setFocusedBranch(null);
        }
      } else {
        setFocusedBranch({ abilityId: node.id });
        if (parentId) setFocusedRootId(parentId);
      }
    } else if (node.level === 2) {
      // --- SKILL CLICK ---
      const parentAbilityId = parentByChild[node.id];
      const rootId = parentAbilityId ? parentByChild[parentAbilityId] : null;

      if (focusedBranch?.skillId === node.id) {
        setFocusedBranch({ abilityId: parentAbilityId });
      } else {
        setFocusedBranch({ abilityId: parentAbilityId, skillId: node.id });
        if (rootId) setFocusedRootId(rootId);
      }
    }
  };

  // Get visible nodes based on focus state (progressive reveal)
  const visibleNodes = useMemo(() => {
    if (!tree || !Array.isArray(tree.nodes)) return [];

    // Get root nodes - filter by focusedRootId if set
    let rootNodes = tree.nodes.filter(n => n.level === 0);
    if (focusedRootId) {
      // Only show the focused root, hide siblings
      rootNodes = rootNodes.filter(n => n.id === focusedRootId);
    }

    let visible = [...rootNodes];

    if (focusedBranch?.abilityId) {
      // Ability is focused - only show that ability (hide siblings)
      const ability = tree.nodes.find(n => n.id === focusedBranch.abilityId);
      if (ability) {
        visible.push(ability);

        // Show skills under this ability
        const abilityChildren = childrenByParent[ability.id] || [];

        if (focusedBranch.skillId) {
          // Skill is focused - only show that skill (hide siblings)
          const skill = tree.nodes.find(n => n.id === focusedBranch.skillId);
          if (skill) {
            visible.push(skill);
            // Show knowledge under this skill
            const skillChildren = childrenByParent[skill.id] || [];
            visible.push(...tree.nodes.filter(n => skillChildren.includes(n.id)));
          }
        } else {
          // No skill focused - show all skills under this ability
          const skills = tree.nodes.filter(n => abilityChildren.includes(n.id));
          visible.push(...skills);
        }
      }
    } else if (focusedRootId) {
      // Root is focused but no ability focused - show all abilities under this root
      const rootChildren = childrenByParent[focusedRootId] || [];
      const abilitiesUnderRoot = tree.nodes.filter(n => rootChildren.includes(n.id));
      visible.push(...abilitiesUnderRoot);
    } else {
      // No focus at all - show all level 0 and level 1
      const abilities = tree.nodes.filter(n => n.level === 1);
      visible.push(...abilities);
    }

    return visible;
  }, [tree, focusedRootId, focusedBranch, childrenByParent]);

  // Position nodes for organic tree display (Avatar at bottom)
  const positionedNodes = useMemo(() => {
    const nodes = visibleNodes.map(n => ({ ...n }));
    if (nodes.length === 0) return [];

    const isMobile = window.innerWidth < 768;

    const byLevel: Record<number, any[]> = {};
    nodes.forEach(node => {
      if (!byLevel[node.level]) byLevel[node.level] = [];
      byLevel[node.level].push(node);
    });

    // Y positions with tall breathing room for mobile viewBox 160 vs 100
    const levelY: Record<number, number> = {
      0: isMobile ? 120 : 75,  // Domains
      1: isMobile ? 90 : 55,  // Abilities
      2: isMobile ? 55 : 35,  // Skills
      3: isMobile ? 20 : 15   // Knowledge (Leaves)
    };

    const result: any[] = [];
    Object.keys(byLevel).forEach(levelStr => {
      const level = parseInt(levelStr);
      const nodesAtLevel = byLevel[level];
      const count = nodesAtLevel.length;

      nodesAtLevel.forEach((node, idx) => {
        let x = 50;
        if (count === 1) x = 50;
        else if (count === 2) x = idx === 0 ? (level === 1 ? 25 : 35) : (level === 1 ? 75 : 65);
        else if (count === 3) x = (level === 1 ? [20, 50, 80] : [25, 50, 75])[idx];
        else {
          const totalWidth = level === 1 ? 85 : 75;
          const startX = (100 - totalWidth) / 2;
          x = startX + (totalWidth / (count - 1)) * idx;
        }

        result.push({
          ...node,
          x,
          y: levelY[level] || (isMobile ? 160 : 80) - level * (isMobile ? 35 : 20),
        });
      });
    });

    return result;
  }, [visibleNodes]);

  // Adapter for RightPanel (UserSkillNode -> SkillNode friendly)
  const selectedNodeAdapter = useMemo(() => {
    if (!selectedNodeId || !tree || !Array.isArray(tree.nodes)) return null;
    const node = tree.nodes.find(n => n.id === selectedNodeId);
    if (!node) return null;

    return {
      id: node.id,
      label: node.name,
      fullName: node.name,
      type: 'skill', // Default to skill type as UserSkillNode doesn't store type explicitly
      level: node.level,
      status: node.status === 'completed' ? 'completed' : node.status === 'in_progress' ? 'in-progress' : 'locked',
      originalNodeId: node.original_node_id,
      nodeData: {
        description: node.description,
        filled: true,
      }
    };
  }, [selectedNodeId, tree]);

  // Stats
  const totalNodes = tree?.nodes?.length || 0;
  const completedNodes = tree?.nodes?.filter(n => n.status === 'completed').length || 0;

  // Loading state
  if (loading) {
    return <PageLoading />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={loadMyTree}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!tree || !tree.nodes || tree.nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
            <TreeDeciduous className="w-12 h-12 text-indigo-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            {t('mySkillTree.emptyState.title')}
          </h2>
          <p className="text-gray-500 mb-6">
            {t('mySkillTree.emptyState.subtitle')}
          </p>
          <button
            onClick={() => navigate('/skilltree')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
            key="empty-state-button"
          >
            <GitBranch className="w-5 h-5" />
            {t('mySkillTree.emptyState.button')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col overflow-hidden bg-white"
    >
      {/* Inject animation styles */}
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      {/* Header */}


      {/* Main Content Area - Tree + Resource Panel */}
      <div className="flex-1 flex overflow-hidden relative md:static">
        {/* Left Content Area: Canvas + Footer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tree Area */}
          <div id="tour-tree-container" className="flex-1 relative overflow-hidden flex flex-col">
            {/* Zoom Controls */}
            <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg border border-slate-200 z-20">
              <button
                onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
                className="p-2 hover:bg-slate-100 rounded-t-xl border-b"
              >
                <Plus className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                className="p-2 hover:bg-slate-100 rounded-b-xl"
              >
                <Minus className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <svg
              className="w-full h-full"
              viewBox={typeof window !== 'undefined' && window.innerWidth < 768 ? "0 0 100 160" : "0 0 100 100"}
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'center bottom'
              }}
            >
              {/* Smooth Panning Wrapper */}
              <g style={{
                transform: `translateY(${cameraOffset}px)`,
                transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              >
                {(() => {
                  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                  const baseX = 50;
                  const baseY = isMobile ? 150 : 92; // Lowered to prevent clipping

                  return (
                    <g key="absolute-base" transform={`translate(${baseX}, ${baseY})`}>
                      <circle r={10} fill="url(#soilGradient)" opacity="0.3" />

                      <g id="tour-tree-avatar" className="node-animate">
                        <circle r={5} fill="none" stroke="#6366f1" strokeWidth="0.1" opacity="0.2" className="animate-ping" style={{ animationDuration: '4s' }} />
                        <circle r={4} fill="white" stroke="#818cf8" strokeWidth="0.4" filter="url(#subtleShadow)" />
                        <image
                          href={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || 'User')}&background=random`}
                          x={-3.6} y={-3.6}
                          width={7.2} height={7.2}
                          clipPath="url(#avatarClip)"
                        />
                      </g>

                      {/* Roots - only show when isVisible to avoid vertical stalk flash */}
                      {isVisible && positionedNodes.filter(n => n.level === 0).map((rootNode) => (
                        <path
                          key={`to-root-${rootNode.id}`}
                          d={generatePath(0, -4.5, rootNode.x - baseX, rootNode.y - baseY)}
                          fill="none"
                          stroke="#818cf8"
                          strokeWidth="0.3"
                          opacity="0.8"
                          className="path-animate"
                        />
                      ))}
                    </g>
                  );
                })()}

                {/* 2. Connection Paths */}
                {(() => {
                  const nodeMap = new Map(positionedNodes.map(n => [n.id, n]));
                  return positionedNodes.map((node) => {
                    const children = childrenByParent[node.id] || [];
                    return children.map(childId => {
                      const target = nodeMap.get(childId);
                      if (!target) return null;

                      const isTargetActive = (node.level === 0 && focusedBranch?.abilityId === childId) ||
                        (node.level === 1 && focusedBranch?.abilityId === node.id) ||
                        (node.level === 2 && focusedBranch?.skillId === node.id);

                      return (
                        <path
                          key={`${node.id}-${childId}`}
                          d={generatePath(node.x, node.y, target.x, target.y)}
                          fill="none"
                          stroke="#818cf8"
                          strokeWidth={isTargetActive ? "0.4" : "0.2"}
                          strokeLinecap="round"
                          opacity={isTargetActive ? 1 : 0.6}
                          className="path-animate"
                        />
                      );
                    });
                  });
                })()}

                {/* 3. Nodes */}
                {positionedNodes.map((node) => {
                  const isSelected = selectedNodeId === node.id;
                  const isFilled = node.status === 'completed' || node.status === 'in_progress';
                  const isExpanded = (node.level === 0 && focusedBranch?.abilityId) ||
                    (node.level === 1 && focusedBranch?.abilityId === node.id) ||
                    (node.level === 2 && focusedBranch?.skillId === node.id);

                  const size = node.level === 0 ? 8 :
                    node.level === 1 ? 7 :
                      node.level === 2 ? 6.5 : 5.5;
                  const radius = size / 2;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onClick={(e) => handleNodeClick(node, e)}
                      className="cursor-pointer node-animate transition-transform duration-300"
                    >
                      {/* LEVEL 0: SPECIALIZATION */}
                      {node.level === 0 && (
                        <g>
                          <circle r={radius + 1.2} fill="white" stroke="#818cf8" strokeWidth="0.4" filter="url(#subtleShadow)" />
                          <image
                            href="/assets/tree/seeding.png"
                            x={-radius * 0.85}
                            y={-radius * 0.85}
                            width={size * 0.85}
                            height={size * 0.85}
                          />
                        </g>
                      )}

                      {/* LEVEL 1: ABILITY */}
                      {node.level === 1 && (
                        <g>
                          <circle r={radius} fill="white" stroke={isExpanded ? "#818cf8" : "#c7d2fe"} strokeWidth="0.3" filter="url(#subtleShadow)" />
                          {node.icon ? (
                            <image href={node.icon} x={-radius * 0.6} y={-radius * 0.6} width={size * 0.6} height={size * 0.6} />
                          ) : (
                            <text textAnchor="middle" dominantBaseline="middle" fill="#6366f1" fontSize="2">⭐</text>
                          )}
                        </g>
                      )}

                      {/* LEVEL 2: SKILL */}
                      {node.level === 2 && (
                        <g>
                          {isFilled && <circle r={radius + 0.5} fill="#6366f1" opacity="0.1" filter="url(#blurFilter)" />}
                          <circle r={radius} fill="white" stroke="#e2e8f0" strokeWidth="0.2" filter="url(#subtleShadow)" />
                          {node.icon ? (
                            <image href={node.icon} x={-radius * 0.6} y={-radius * 0.6} width={size * 0.6} height={size * 0.6} clipPath="circle(40% at 50% 50%)" />
                          ) : (
                            <text textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize="1.5">⚡</text>
                          )}
                          {isFilled && (
                            <circle
                              r={radius} fill="none" stroke={isSelected ? "#a5b4fc" : "#6366f1"} strokeWidth="0.3"
                              strokeDasharray={`${radius * 4} ${radius * 2}`} className="animate-spin-slow"
                              style={{ transformOrigin: 'center', animationDuration: '20s' }}
                            />
                          )}
                        </g>
                      )}

                      {/* LEVEL 3: KNOWLEDGE */}
                      {node.level === 3 && (
                        <g>
                          <circle r={radius} fill="white" stroke={isFilled ? "#818cf8" : "#e2e8f0"} strokeWidth="0.2" filter="url(#subtleShadow)" />
                          {node.icon ? (
                            <image href={node.icon} x={-radius * 0.6} y={-radius * 0.6} width={size * 0.6} height={size * 0.6} />
                          ) : (
                            <circle r={0.5} fill={isFilled ? "#818cf8" : "#cbd5e1"} />
                          )}
                        </g>
                      )}

                      {/* Label - Fixed vertical clipping */}
                      <foreignObject x={-9} y={radius + 2.2} width={18} height={14}>
                        <div className={`px-0.5 text-center text-[2.1px] font-semibold leading-normal drop-shadow-sm ${isSelected ? 'text-indigo-600' : 'text-slate-600'}`}>
                          {node.name.length > 20 ? node.name.substring(0, 18) + '...' : node.name}
                        </div>
                      </foreignObject>
                    </g>
                  );
                })}
              </g>

              {/* Definitions */}
              <defs>
                <clipPath id="avatarClip"><circle cx="0" cy="0" r="3.2" /></clipPath>

                <radialGradient id="soilGradient">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </radialGradient>

                <linearGradient id="trunkGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>

                <filter id="subtleShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="0.2" result="blur" />
                  <feOffset in="blur" dx="0.1" dy="0.1" result="offsetBlur" />
                  <feFlood floodColor="#cbd5e1" floodOpacity="0.4" result="offsetColor" />
                  <feComposite in="offsetColor" in2="offsetBlur" operator="in" />
                  <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="blurFilter"><feGaussianBlur stdDeviation="0.4" /></filter>
              </defs>
            </svg>

            {/* Floating Open Resource Button for Mobile */}
            {selectedNodeId && rightPanelCollapsed && (
              <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
                <button
                  onClick={() => setRightPanelCollapsed(false)}
                  className="shiny-tag relative px-6 py-3 bg-indigo-500 text-white rounded-full text-sm font-black uppercase tracking-tight border border-white/20 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all whitespace-nowrap"
                >
                  <span className="relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                    {t('skillTree.page.viewDetails', 'Xem chi tiết')}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Control Bar */}
          <footer id="tour-master-footer" className="h-[64px] border-t border-slate-200 bg-white flex flex-col justify-center z-30 flex-shrink-0">
            <div className="px-2 md:px-4 flex items-center justify-between md:justify-between w-full overflow-x-auto no-scrollbar gap-2 sm:gap-4 md:gap-0">
              <div className="flex items-center gap-2 md:gap-4 shrink-0">
                <span className="px-2 py-0.5 md:px-3 md:py-1.5 bg-indigo-100 text-indigo-700 text-[10px] md:text-xs font-bold rounded-full whitespace-nowrap border border-indigo-200">
                  {t('common.level')} {Math.min(Math.floor(totalNodes / 5) + 1, 99)}
                </span>
                <span className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-wider hidden sm:inline-block">
                  {completedNodes}/{totalNodes} {t('mySkillTree.completed')}
                </span>
                <span className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-wider sm:hidden">
                  {completedNodes}/{totalNodes}
                </span>

                {/* Back button when focused */}
                {(focusedRootId || focusedBranch) && (
                  <button
                    onClick={() => {
                      if (focusedBranch?.skillId) {
                        setFocusedBranch({ abilityId: focusedBranch.abilityId });
                      } else if (focusedBranch?.abilityId) {
                        setFocusedBranch(null);
                      } else if (focusedRootId) {
                        setFocusedRootId(null);
                      }
                    }}
                    className="flex items-center gap-1 md:gap-2 px-2 py-1.5 md:px-3 md:py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-[10px] md:text-xs font-medium text-slate-600 transition-colors shadow-sm focus:outline-none"
                  >
                    <div className="flex w-4 h-4 md:w-5 md:h-5 items-center justify-center bg-slate-100 rounded-md md:rounded-lg text-indigo-600 font-bold shrink-0">←</div>
                    <span>{t('common.back')}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 md:gap-3 shrink-0 pr-2 md:pr-0">
                <button
                  onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                  className="md:hidden p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl border border-indigo-100 transition-colors"
                >
                  <BookOpen className="w-5 h-5" />
                </button>

                <button
                  id="tour-add-skills"
                  onClick={() => navigate('/skilltree')}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium whitespace-nowrap shadow-sm hover:shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('mySkillTree.addSkills')}</span>
                  <span className="sm:hidden">Thêm</span>
                </button>
              </div>
            </div>
          </footer>
        </div>

        {/* Right Panel */}
        <div id="tour-skill-panel" className="flex-shrink-0 h-full">
          <RightPanel
            selectedNode={selectedNodeAdapter as any}
            getNodeStatus={(node) => node.status as any}
            // Pass dummy chat props to satisfy interface but they won't be used actively
            messages={[]}
            status="idle"
            error={null}
            onClearError={() => { }}
            onSend={() => { }}
            sessions={[]}
            sessionsLoading={false}
            hasMore={false}
            onLoadMore={async () => { }}
            loadingMore={false}
            currentSessionId={null}
            onSelectSession={() => { }}
            onNewChat={() => { }}
            isCollapsed={rightPanelCollapsed}
            onToggleCollapse={() => setRightPanelCollapsed(!rightPanelCollapsed)}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            hideChat={true}
          />
        </div>
      </div>
    </div>
  );
}
