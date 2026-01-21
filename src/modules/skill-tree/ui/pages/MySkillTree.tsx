import React, { useState, useEffect, useMemo } from 'react';
import { GitBranch, Loader2, TreeDeciduous, Plus, Minus, BookOpen, Brain, Star, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { skillTreeGateway } from '../../providers';
import { useAuth } from '@/modules/auth/AuthProvider';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PageLoading } from '@/shared/components/PageLoading';

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
}

interface UserSkillTree {
  id: string;
  name: string;
  nodes: UserSkillNode[];
  edges: { source: string; target: string }[];
}

type FilterTab = 'all' | 'knowledge' | 'skills' | 'abilities';

// CSS styles for animations
const animationStyles = `
  @keyframes nodePopIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  
  @keyframes pathDraw {
    0% { stroke-dashoffset: 50; opacity: 0.3; }
    100% { stroke-dashoffset: 0; opacity: 1; }
  }
  
  .node-animate {
    animation: nodePopIn 0.4s ease-out forwards;
  }
  
  .path-animate {
    stroke-dasharray: 50;
    stroke-dashoffset: 50;
    animation: pathDraw 0.8s ease-out 0.3s forwards;
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

  // Camera Y position - pans up as user goes deeper into tree (Candy Crush style)
  const cameraY = useMemo(() => {
    // Height check: Screen is 80 units. 2/3 is ~53 units.
    
    if (focusedBranch?.skillId) {
      // Viewing knowledge level (Level 3 at y=10)
      // Tree roughly spans y=10 to y=70 (Height 60 > 53) -> Pan needed
      // Pan to -20 to show: Knowledge(10->30), Skill(30->50), Ability(50->70)
      // Root(70->90) will be scrolled off
      return -20;
    } 
    
    // Viewing skills level (Level 2 at y=30)
    // Tree spans y=30 to y=70 (Height 40 < 53) -> No pan needed
    return 0;
  }, [focusedRootId, focusedBranch]);

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

  // Generate bezier path between nodes (original - for node connections)
  const generatePath = (fromX: number, fromY: number, toX: number, toY: number) => {
    const midY = (fromY + toY) / 2;
    return `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
  };

  // Generate softer curve for trunk to root connections (organic S-curve)
  const generateTrunkPath = (fromX: number, fromY: number, toX: number, toY: number) => {
    // Smoother organic curve with control points spread out
    const midY = (fromY + toY) / 2;
    const controlSpread = Math.abs(toX - fromX) * 0.4;
    
    // Create natural S-curve
    return `M ${fromX} ${fromY} 
            C ${fromX} ${fromY + (midY - fromY) * 0.5}, 
              ${toX > fromX ? fromX + controlSpread : fromX - controlSpread} ${midY}, 
              ${toX} ${toY}`;
  };

  // Handle node click with focus/expand effect
  const handleNodeClick = (node: UserSkillNode & { x: number; y: number }) => {
    setSelectedNodeId(node.id);
    
    if (node.level === 0) {
      // Root node (Backend/Frontend): Toggle focus - hide siblings
      if (focusedRootId === node.id) {
        // Already focused, unfocus
        setFocusedRootId(null);
        setFocusedBranch(null);
      } else {
        // Focus on this root, hide other roots
        setFocusedRootId(node.id);
        setFocusedBranch(null);
      }
    } else if (node.level === 1) {
      // Ability: Toggle expand to show/hide skills
      if (focusedBranch?.abilityId === node.id && focusedBranch?.skillId) {
        setFocusedBranch({ abilityId: node.id }); // Collapse skills
      } else if (focusedBranch?.abilityId === node.id) {
        setFocusedBranch(null); // Collapse ability
      } else {
        setFocusedBranch({ abilityId: node.id });
      }
    } else if (node.level === 2) {
      // Skill: Toggle expand to show/hide knowledge
      const parentAbility = tree?.nodes.find(n => 
        n.level === 1 && tree.edges.some(e => e.source === n.id && e.target === node.id)
      );
      if (focusedBranch?.skillId === node.id) {
        setFocusedBranch({ abilityId: parentAbility?.id }); // Collapse knowledge
      } else {
        setFocusedBranch({ abilityId: parentAbility?.id, skillId: node.id });
      }
    }
  };

  // Build parent-child map
  const childrenByParent = useMemo(() => {
    if (!tree) return {};
    const map: Record<string, string[]> = {};
    tree.edges.forEach(edge => {
      if (!map[edge.source]) map[edge.source] = [];
      map[edge.source].push(edge.target);
    });
    return map;
  }, [tree]);

  // Get visible nodes based on focus state (progressive reveal)
  const visibleNodes = useMemo(() => {
    if (!tree?.nodes) return [];
    
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

  // Position nodes for tree layout (inverted pyramid - root at bottom)
  const positionedNodes = useMemo(() => {
    if (!visibleNodes.length) return [];
    
    const byLevel: Record<number, (UserSkillNode & { x?: number; y?: number })[]> = {};
    visibleNodes.forEach(n => {
      if (!byLevel[n.level]) byLevel[n.level] = [];
      byLevel[n.level].push({ ...n });
    });
    
    // Y positions (root at bottom, knowledge at top)
    const levelY: Record<number, number> = { 0: 70, 1: 50, 2: 30, 3: 10 };
    
    const result: (UserSkillNode & { x: number; y: number })[] = [];
    
    Object.keys(byLevel).forEach(levelStr => {
      const level = parseInt(levelStr);
      const nodesAtLevel = byLevel[level];
      const count = nodesAtLevel.length;
      
      nodesAtLevel.forEach((node, idx) => {
        let x = 50;
        if (count === 1) {
          x = 50;
        } else if (count === 2) {
          x = idx === 0 ? 35 : 65;
        } else if (count === 3) {
          x = [25, 50, 75][idx];
        } else {
          const totalWidth = 80;
          const startX = (100 - totalWidth) / 2;
          x = count > 1 ? startX + (totalWidth / (count - 1)) * idx : 50;
        }
        
        result.push({
          ...node,
          x,
          y: levelY[level] ?? (70 - level * 15),
        });
      });
    });
    
    return result;
  }, [visibleNodes]);

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
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 overflow-hidden">
      {/* Inject animation styles */}
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      {/* Header */}
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
              LVL {Math.min(Math.floor(totalNodes / 5) + 1, 99)}
            </span>
            <span className="text-sm text-slate-500">
              {completedNodes}/{totalNodes} {t('mySkillTree.completed')}
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
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-medium text-slate-600 transition-colors"
              >
                ← {t('common.back')}
              </button>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {tree.name || t('mySkillTree.title')}
          </h1>
          <button
            onClick={() => navigate('/skilltree')}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('mySkillTree.addSkills')}
          </button>
        </div>
      </header>

      {/* Main Tree Area */}
      <div className="flex-1 relative overflow-hidden">
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

        {/* SVG Tree Visualization */}
        <svg 
          className="w-full h-full transition-all duration-500 ease-out" 
          viewBox={`0 ${cameraY} 100 80`}
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center bottom' }}
        >
          {/* Central trunk - lines from each root node (level 0) to bottom center */}
          {(() => {
            const rootNodes = positionedNodes.filter(n => n.level === 0);
            const trunkY = 78;
            const trunkX = 50;
            
            if (rootNodes.length === 0) return null;
            
            return (
              <>
                {/* Main vertical trunk */}
                <line
                  x1={trunkX} y1={trunkY}
                  x2={trunkX} y2={trunkY - 5}
                  stroke="#6366f1"
                  strokeWidth="1"
                  className="path-animate"
                />
                
                {/* Lines from trunk to each root node */}
                {rootNodes.map((rootNode) => {
                  const colors = getNodeColor(rootNode.level, rootNode.status);
                  return (
                    <path
                      key={`trunk-${rootNode.id}`}
                      d={generateTrunkPath(trunkX, trunkY - 5, rootNode.x, rootNode.y + 3)}
                      fill="none"
                      stroke={colors.border}
                      strokeWidth="0.6"
                      className="path-animate"
                    />
                  );
                })}
              </>
            );
          })()}

          {/* Connection Paths - from parent to children */}
          {positionedNodes.map(node => {
            const children = childrenByParent[node.id] || [];
            return children.map(childId => {
              const child = positionedNodes.find(n => n.id === childId);
              if (!child) return null;
              
              const colors = getNodeColor(child.level, child.status);
              return (
                <path
                  key={`${node.id}-${childId}`}
                  d={generatePath(node.x, node.y, child.x, child.y)}
                  fill="none"
                  stroke={colors.border}
                  strokeWidth="0.5"
                  className="path-animate"
                />
              );
            });
          })}

          {/* Nodes */}
          {positionedNodes.map(node => {
            const isSelected = selectedNodeId === node.id;
            const hasChildren = (childrenByParent[node.id] || []).length > 0;
            const isExpanded = (node.level === 0 && focusedBranch?.abilityId) ||
                              (node.level === 1 && focusedBranch?.abilityId === node.id) ||
                              (node.level === 2 && focusedBranch?.skillId === node.id);
            const colors = getNodeColor(node.level, node.status);
            const size = node.level === 0 ? 6 : node.level === 1 ? 5 : 4;
            const radius = size / 2;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => handleNodeClick(node)}
                className="cursor-pointer"
              >
                {/* Glow effect for selected/expanded */}
                {(isSelected || isExpanded) && (
                  <circle
                    r={radius + 1.5}
                    fill="none"
                    stroke={colors.bg}
                    strokeWidth="0.3"
                    opacity="0.5"
                    className="animate-pulse"
                  />
                )}

                {/* Main circle */}
                <circle
                  r={radius}
                  fill={colors.bg}
                  stroke={isSelected ? '#fff' : colors.border}
                  strokeWidth={isSelected ? '0.5' : '0.3'}
                  className="transition-all hover:opacity-90"
                />

                {/* Icon inside */}
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={node.level === 0 ? '2' : '1.5'}
                  fontWeight="bold"
                >
                  {node.level === 0 ? '🧠' : node.level === 1 ? '⭐' : node.level === 2 ? '💡' : '📖'}
                </text>

                {/* Label */}
                <text
                  y={radius + 2.5}
                  textAnchor="middle"
                  fill="#475569"
                  fontSize="1.4"
                  fontWeight="600"
                  className="uppercase tracking-wider"
                >
                  {node.name.length > 12 ? node.name.substring(0, 10) + '...' : node.name}
                </text>

                {/* Expand indicator - show if has children and not fully expanded */}
                {hasChildren && !isExpanded && (
                  <text
                    y={radius + 4.5}
                    textAnchor="middle"
                    fill={colors.bg}
                    fontSize="0.9"
                    fontWeight="bold"
                  >
                    + {t('mySkillTree.node.clickToExpand')}
                  </text>
                )}

                {/* Expanded indicator */}
                {isExpanded && (
                  <text
                    y={radius + 4.5}
                    textAnchor="middle"
                    fill={colors.bg}
                    fontSize="0.9"
                  >
                    ▼
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom Bar */}
      <div className="flex-shrink-0 bg-white border-t border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="font-semibold text-slate-800 text-sm">{user?.fullName || 'User'}</div>
              <div className="text-[10px] text-slate-500 uppercase">{t('mySkillTree.user.role')}</div>
            </div>
            <div className="flex items-center gap-3 ml-2 pl-3 border-l border-slate-200">
              <div className="text-center">
                <div className="text-sm font-bold text-indigo-600">{completedNodes * 100}</div>
                <div className="text-[9px] text-slate-400 uppercase">{t('mySkillTree.stats.xp')}</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-indigo-600">{totalNodes}</div>
                <div className="text-[9px] text-slate-400 uppercase">{t('mySkillTree.stats.nodes')}</div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="inline-flex bg-slate-100 rounded-xl p-1">
            {(['knowledge', 'skills', 'abilities', 'all'] as FilterTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeFilter === tab
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'knowledge' && <BookOpen className="w-4 h-4" />}
                {tab === 'skills' && <Brain className="w-4 h-4" />}
                {tab === 'abilities' && <Star className="w-4 h-4" />}
                {tab === 'all' && <Layers className="w-4 h-4" />}
                <span className="uppercase tracking-wider text-xs">
                  {t(`mySkillTree.tabs.${tab}`)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
