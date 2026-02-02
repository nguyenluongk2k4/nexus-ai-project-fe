import { useState, useEffect } from 'react';
import { X, RefreshCw, ChevronRight, ChevronDown, Eye, ArrowRightLeft, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getSkillTreeService } from '../../providers';
import { treeNodeService } from '../../domain/services/treeNodeService';

interface NodeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: {
    id: string;
    label: string;
    fullName?: string;
    type: string;
    level: number;
    description?: string;
    icon?: string;
  };
  sessionId?: string;
  onNodeUpdated?: () => void;
  treeNodes?: any[];
}

// Helper to render icon (emoji or image)
const renderIcon = (icon?: string, className?: string) => {
  if (!icon) return null;
  const isImage = icon.startsWith('/') || icon.startsWith('http');
  if (isImage) {
    return <img src={icon} alt="" className={className || "w-full h-full object-contain rounded-lg"} />;
  }
  return <span className={className}>{icon}</span>;
};

// Tree item component for preview - matching design
const TreeItem = ({ node, allNodes, depth = 0, isLast = false }: any) => {
  const [expanded, setExpanded] = useState(true);

  const children = allNodes.filter((n: any) =>
    n.parentId === node.id || n.parent_id === node.id
  );
  const hasChildren = children.length > 0;

  const { t } = useTranslation();

  const typeConfig: Record<string, { bg: string, colorClass: string, label: string }> = {
    'ability': { bg: 'bg-fuchsia-500', colorClass: 'text-fuchsia-500', label: t('mySkillTree.panel.nodeTypes.ability').toUpperCase() },
    'specialization': { bg: 'bg-fuchsia-500', colorClass: 'text-fuchsia-500', label: t('mySkillTree.panel.nodeTypes.specialization').toUpperCase() },
    'skill': { bg: 'bg-pink-500', colorClass: 'text-pink-500', label: t('mySkillTree.panel.nodeTypes.skill').toUpperCase() },
    'knowledge': { bg: 'bg-orange-500', colorClass: 'text-orange-500', label: t('mySkillTree.panel.nodeTypes.knowledge').toUpperCase() }
  };

  const config = typeConfig[node.type] || { bg: 'bg-slate-400', colorClass: 'text-slate-500', label: node.type?.toUpperCase() };

  return (
    <div>
      {/* Node row */}
      <div
        className="flex items-center gap-3 py-2 px-2 hover:bg-slate-50 rounded-lg cursor-pointer"
        style={{ paddingLeft: depth * 28 + 8 }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {/* Expand/collapse or spacer */}
        {hasChildren ? (
          <button className="p-0.5 hover:bg-slate-200 rounded">
            {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>
        ) : (
          <div className="w-5" />
        )}

        {/* Avatar / Icon */}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${config.bg}`}>
          {node.icon ? (
            renderIcon(node.icon, "text-sm")
          ) : (
            <span className="text-xs">{node.type?.[0]?.toUpperCase() || 'N'}</span>
          )}
        </div>
        {/* Name */}
        <span className="flex-1 text-sm text-slate-700 truncate">
          {node.name || node.label}
        </span>

        {/* Type badge */}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${config.colorClass}`}>
          {config.label}
        </span>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="border-l-2 border-slate-100" style={{ marginLeft: depth * 28 + 24 }}>
          {children.map((child: any, index: number) => (
            <TreeItem
              key={child.id}
              node={child}
              allNodes={allNodes}
              depth={depth + 1}
              isLast={index === children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Alternative card component
const AlternativeCard = ({
  alt,
  isSelected,
  onSelect,
  onSwap,
  isSwapping
}: {
  alt: any;
  isSelected: boolean;
  onSelect: () => void;
  onSwap: () => void;
  isSwapping: boolean;
}) => {
  const getDifficultyStyle = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-600';
      case 'intermediate': return 'bg-yellow-100 text-yellow-600';
      case 'advanced': return 'bg-red-100 text-red-600';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${isSelected
        ? 'border-indigo-400 bg-indigo-50/50 shadow-md'
        : 'border-slate-200 bg-white hover:border-slate-300'
        }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar / Icon */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-slate-700 text-lg font-bold flex-shrink-0 overflow-hidden ${alt.type === 'knowledge' ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200'
          }`}>
          {alt.icon ? (
            renderIcon(alt.icon, "w-8 h-8")
          ) : (
            <span>{alt.name?.[0]?.toUpperCase() || alt.type?.[0]?.toUpperCase() || 'A'}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-800 text-sm truncate mb-0.5">{alt.name}</h4>
          <p className="text-xs text-slate-400 uppercase font-medium tracking-wide">{alt.type || 'ABILITY'}</p>
          {alt.description && (
            <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{alt.description}</p>
          )}

          {/* Difficulty badge */}
          {alt.metadata?.difficultyLevel && (
            <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-bold rounded uppercase ${getDifficultyStyle(alt.metadata.difficultyLevel)}`}>
              {alt.metadata.difficultyLevel}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className={`p-2 rounded-lg transition-colors ${isSelected
              ? 'bg-indigo-500 text-white'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onSwap(); }}
            disabled={isSwapping}
            className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:bg-violet-100 hover:text-violet-500 transition-colors disabled:opacity-50"
            title="Swap"
          >
            {isSwapping ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export const NodeManagementModal = ({
  isOpen,
  onClose,
  node,
  sessionId,
  onNodeUpdated,
}: NodeManagementModalProps) => {
  const { t } = useTranslation();
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [swappingId, setSwappingId] = useState<string | null>(null);
  const [selectedAlt, setSelectedAlt] = useState<any | null>(null);
  const [previewSubTree, setPreviewSubTree] = useState<any[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    if (isOpen && node.id) {
      loadAlternatives();
      setSelectedAlt(null);
      setPreviewSubTree([]);
    }
  }, [isOpen, node.id]);

  const loadAlternatives = async () => {
    setLoading(true);
    setError(null);
    try {
      const service = getSkillTreeService();
      const result = await service.getNodeAlternatives(node.id, node.level, sessionId);
      setAlternatives(result || []);
    } catch (e) {
      console.error('Failed to load alternatives:', e);
      setError(t('skillTree.rightPanel.nodeManagement.errors.load'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (alt: any) => {
    // Toggle off
    if (selectedAlt?.id === alt.id) {
      setSelectedAlt(null);
      setPreviewSubTree([]);
      return;
    }

    setSelectedAlt(alt);
    setLoadingPreview(true);

    try {
      // Use data directly from alternative object - no extra API calls
      const subTree: any[] = [];

      // Check if alternative has children data from API response
      const children = alt.children || alt.sub_nodes || [];

      if (children.length > 0) {
        // First pass: identify skills (level 2) - these are direct children of ability
        const skills = children.filter((c: any) => c.type === 'skill' || c.level === 2);
        const knowledgeItems = children.filter((c: any) => c.type === 'knowledge' || c.level === 3);

        // Add skills first (they are root level in preview since we don't show ability)
        skills.forEach((skill: any) => {
          subTree.push({
            id: skill.id,
            name: skill.name || skill.label,
            type: skill.type || 'skill',
            level: skill.level || 2,
            description: skill.description,
            icon: skill.icon,
            parentId: null, // Skills are root in preview
            parent_id: null,
          });
        });

        // Add knowledge items with their correct parentId (pointing to skill)
        knowledgeItems.forEach((knowledge: any) => {
          // Find if this knowledge's parent skill exists in our skills list
          const parentSkillId = knowledge.parentId || knowledge.parent_id;
          const parentExists = skills.some((s: any) => s.id === parentSkillId);

          subTree.push({
            id: knowledge.id,
            name: knowledge.name || knowledge.label,
            type: knowledge.type || 'knowledge',
            level: knowledge.level || 3,
            description: knowledge.description,
            icon: knowledge.icon,
            parentId: parentExists ? parentSkillId : null, // Link to skill if exists
            parent_id: parentExists ? parentSkillId : null,
          });
        });
      }

      setPreviewSubTree(subTree);
    } catch (e) {
      console.error('Preview failed:', e);
      setPreviewSubTree([]);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSwap = async (alt: any) => {
    if (!sessionId) {
      setError(t('skillTree.rightPanel.nodeManagement.errors.session'));
      return;
    }

    setSwappingId(alt.id);
    try {
      const service = getSkillTreeService();
      const result = await service.swapNode(sessionId, node.id, alt);

      if (result?.nodes) {
        treeNodeService.setNodes(result.nodes);
      }

      onNodeUpdated?.();
      onClose();
    } catch (e) {
      console.error('Swap failed:', e);
      setError(t('skillTree.rightPanel.nodeManagement.errors.swap'));
    } finally {
      setSwappingId(null);
    }
  };

  const clearPreview = () => {
    setSelectedAlt(null);
    setPreviewSubTree([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{t('skillTree.rightPanel.nodeManagement.title')}</h2>
              <p className="text-sm text-slate-500">{t('skillTree.rightPanel.nodeManagement.subtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">

          {/* Left - Current Node & Preview */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-slate-100">

            {/* Current Active Node */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('skillTree.rightPanel.nodeManagement.currentActive')}</span>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded">ID:{node.id.slice(0, 8)}</span>
              </div>

              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-slate-700 font-bold flex-shrink-0 overflow-hidden ${node.type === 'ability' || node.type === 'specialization' ? 'bg-fuchsia-100 text-fuchsia-600 border border-fuchsia-200' :
                  'bg-white border border-slate-200'
                  }`}>
                  {node.icon ? (
                    renderIcon(node.icon, "text-3xl")
                  ) : (
                    <span className="text-xl">{node.type?.[0]?.toUpperCase() || 'N'}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{node.fullName || node.label}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-indigo-500 uppercase">{node.type}</span>
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs font-medium text-slate-400">LEVEL {node.level}</span>
                  </div>
                  {node.description && (
                    <p className="text-sm text-slate-600 leading-relaxed">{node.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Sub-tree */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('skillTree.rightPanel.nodeManagement.preview.title')}</span>
                </div>
                {selectedAlt && (
                  <button onClick={clearPreview} className="text-xs font-medium text-indigo-500 hover:text-indigo-600">
                    {t('skillTree.rightPanel.nodeManagement.preview.clear')}
                  </button>
                )}
              </div>

              {selectedAlt ? (
                <>
                  <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                      <span className="text-white text-[10px]">i</span>
                    </div>
                    <p className="text-xs text-indigo-700">
                      {t('skillTree.rightPanel.nodeManagement.preview.previewing')} "<span className="font-semibold">{selectedAlt.name}</span>"
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 max-h-64 overflow-y-auto">
                    {loadingPreview ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                      </div>
                    ) : previewSubTree.length > 0 ? (
                      <div>
                        {/* Show all top-level nodes (skills without parent) */}
                        {previewSubTree.filter(n => !n.parentId && !n.parent_id).map((skillNode, index, arr) => (
                          <TreeItem
                            key={skillNode.id}
                            node={skillNode}
                            allNodes={previewSubTree}
                            depth={0}
                            isLast={index === arr.length - 1}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-sm text-slate-400 py-4">{t('skillTree.rightPanel.nodeManagement.preview.noSubNodes')}</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-slate-50 rounded-xl p-8 border border-dashed border-slate-200 text-center">
                  <p className="text-sm text-slate-400">{t('skillTree.rightPanel.nodeManagement.alternatives.empty')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right - Alternatives */}
          <div className="w-[380px] p-6 overflow-y-auto bg-slate-50/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('skillTree.rightPanel.nodeManagement.title')}</span>
              <button
                onClick={loadAlternatives}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-600"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                {t('skillTree.rightPanel.nodeManagement.alternatives.refresh')}
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm mb-4">
                {error}
              </div>
            )}

            {/* List */}
            {!loading && !error && (
              <div className="space-y-3">
                {alternatives.map((alt) => (
                  <AlternativeCard
                    key={alt.id}
                    alt={alt}
                    isSelected={selectedAlt?.id === alt.id}
                    onSelect={() => handleSelect(alt)}
                    onSwap={() => handleSwap(alt)}
                    isSwapping={swappingId === alt.id}
                  />
                ))}

                {alternatives.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-sm">No alternatives found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            {t('skillTree.rightPanel.nodeManagement.actions.close')}
          </button>

          {selectedAlt && (
            <button
              onClick={() => handleSwap(selectedAlt)}
              disabled={swappingId !== null}
              className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-sm font-semibold text-white transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {swappingId ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRightLeft className="w-4 h-4" />
              )}
              {t('skillTree.rightPanel.nodeManagement.alternatives.swapTo')} "{selectedAlt.name?.length > 20 ? selectedAlt.name.slice(0, 20) + '...' : selectedAlt.name}"
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
