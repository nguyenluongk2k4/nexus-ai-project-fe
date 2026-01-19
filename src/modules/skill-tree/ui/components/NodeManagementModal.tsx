import React, { useState, useEffect } from 'react';
import { Settings, X, Plus, Lock, CheckCircle, Clock } from 'lucide-react';
import { SkillTreeHttpGateway } from '../../infrastructure/gateway/SkillTreeHttpGateway'; // Import gateway directly or use DI
import './NodeManagementModal.css';

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
  };
  sessionId?: string;
  onNodeUpdated?: () => void;
  treeNodes?: any[]; // Pass all nodes context
}

interface SubNode {
  id: string;
  label: string;
  type: string;
  level: number;
  children?: SubNode[];
}

interface AlternativeNode {
  id: string;
  name: string;
  description: string;
  similarity_score?: number;
  type?: string;
  children?: any[]; 
}

// Recursive Tree Item Component
const RecursiveTreeItem = ({ node, isLast }: { node: SubNode, isLast: boolean }) => {
    return (
        <div className="tree-item-container" style={{ position: 'relative' }}>
             {/* Node Row */}
            <div className={`tree-node child-node level-${node.level}`} style={{ marginLeft: '12px', marginTop: '4px' }}>
                {/* Connection Line Horizontal */}
                <div style={{
                    position: 'absolute',
                    left: '-12px',
                    top: '18px',
                    width: '20px',
                    height: '1px',
                    backgroundColor: '#cbd5e1'
                }}></div>
                
                {/* Connection Line Vertical (to parent) logic handled by parent container's border */}
                
                <div className={`node-icon ${node.type === 'knowledge' ? 'bg-knowledge' : 'bg-skill'}`}>
                    {node.type === 'knowledge' ? '📘' : '🛠️'}
                </div>
                <div className="node-details">
                    <h4>{node.label}</h4>
                    <span className="uppercase">{node.type}</span>
                </div>
            </div>

            {/* Children Container */}
            {node.children && node.children.length > 0 && (
                <div className="tree-children-container" style={{ 
                    marginLeft: '22px', 
                    paddingLeft: '0',
                    borderLeft: isLast ? 'none' : '1px solid #e2e8f0' // Continue line if not last
                }}>
                    {node.children.map((child, idx) => (
                         // Line connector logic needs improving for perfect tree, 
                         // but this is a good approximation for 'folder structure'
                         <div key={child.id} style={{ position: 'relative', paddingLeft: '0px' }}>
                             {/* Vertical line segment for child */}
                             <div style={{
                                 position: 'absolute',
                                 left: '0', // Aligned with parent's border left
                                 top: '0',
                                 bottom: idx === node.children!.length - 1 ? 'calc(100% - 18px)' : '0', // Stop line at last child
                                 width: '1px',
                                 backgroundColor: '#cbd5e1'
                             }}></div>
                             
                            <RecursiveTreeItem node={child} isLast={idx === node.children!.length - 1} />
                         </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const NodeManagementModal: React.FC<NodeManagementModalProps> = ({ isOpen, onClose, node, sessionId, onNodeUpdated, treeNodes = [] }) => {
  const [previewNode, setPreviewNode] = useState<any>(node);

  const [loadingChildren, setLoadingChildren] = useState(false);
  const [children, setChildren] = useState<SubNode[]>([]); // Nested structure
  
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);
  const [alternatives, setAlternatives] = useState<AlternativeNode[]>([]);
  
  const [isSwapping, setIsSwapping] = useState(false);

  // Update preview when node prop changes
  useEffect(() => {
    if (isOpen) { 
        setPreviewNode(node); 
    }
  }, [isOpen, node]);

  // Derived values
  const title = previewNode.fullName || previewNode.label || previewNode.name; 
  const description = previewNode.description || 'This foundational node encompasses the essential knowledge required for mastery.';
  const currentLevel = previewNode.level || node.level;
  const importance = currentLevel === 1 ? 'Critical' : 'High Priority';
  const difficulty = currentLevel > 2 ? 'Expert' : 'Advanced';
  const isPreviewingOriginal = previewNode.id === node.id;

  // 1. Fetch/Build Children Hierarchy
  useEffect(() => {
    // Helper to map generic objects to SubNode
    const mapToSubNode = (n: any): SubNode => ({
        id: n.id,
        label: n.name || n.label,
        type: n.type,
        level: n.level,
        children: n.children ? n.children.map(mapToSubNode) : []
    });

    if (isOpen && previewNode.id) {
      setLoadingChildren(true);
      
      const isOriginal = previewNode.id === node.id;
      
      if (isOriginal) {
          // ORIGINAL NODE: Build tree from 'treeNodes' prop (Full Context)
          if (treeNodes && treeNodes.length > 0) {
              // 1. Find direct children
              const findChildrenRecursive = (parentId: string): SubNode[] => {
                  const directChildren = treeNodes.filter(n => 
                      n.parentId === parentId || 
                      (n.connections && n.connections.includes(n.id)) // Fallback if connections logic was reversed (unlikely)
                  );
                  // Better logic: treeNodes usually have 'parentId' property
                  const matches = treeNodes.filter(n => n.parentId === parentId || (n as any).parent_id === parentId);
                  
                  return matches.map(child => ({
                      id: child.id,
                      label: child.name || child.label,
                      type: child.type || (child.level === 3 ? 'knowledge' : 'skill'),
                      level: child.level,
                      children: findChildrenRecursive(child.id)
                  }));
              };
              
              const hierarchy = findChildrenRecursive(node.id);
              setChildren(hierarchy);
              setLoadingChildren(false);
          } else {
             // Fallback to API if treeNodes not provided
             // This keeps old behavior (1 level only) but it's safe
             const gateway = new SkillTreeHttpGateway();
             gateway.getNodeChildren(previewNode.id, sessionId)
                .then((data) => {
                     // Flat list to basic nodes
                     const mapped = data.nodes.map((n: any) => ({
                         id: n.id,
                         label: n.label || n.data?.name,
                         type: n.data?.type || 'skill',
                         level: n.level || (currentLevel + 1),
                         children: [] 
                     }));
                     setChildren(mapped);
                })
                .finally(() => setLoadingChildren(false));
          }
      } else {
          // PREVIEW NODE: Validating if 'children' is flat list or nested
          if (previewNode.children && previewNode.children.length > 0) {
              const flatList = previewNode.children;
              
              // Helper to transform flat list into hierarchy based on parentId
              const findDescendantsRecursive = (parentId: string): SubNode[] => {
                  const matches = flatList.filter((n: any) => 
                      n.parentId === parentId || n.parent_id === parentId
                  );
                  
                  return matches.map((child: any) => ({
                      id: child.id,
                      label: child.name || child.label,
                      type: child.type,
                      level: child.level,
                      children: findDescendantsRecursive(child.id)
                  }));
              };

              // Start building from the Preview Node ID
              const hierarchy = findDescendantsRecursive(previewNode.id);
              
              // Fallback: If hierarchy is empty but we have children (maybe parentIds don't match or it's already nested?), 
              // check if it's already nested (unlikely from current backend but safe to check)
              if (hierarchy.length === 0 && flatList.some((n:any) => n.children)) {
                   const mapToSubNode = (n: any): SubNode => ({
                        id: n.id,
                        label: n.name || n.label,
                        type: n.type,
                        level: n.level,
                        children: n.children ? n.children.map(mapToSubNode) : []
                    });
                    setChildren(flatList.map(mapToSubNode));
              } else {
                  setChildren(hierarchy);
              }
          } else {
              setChildren([]);
          }
          setLoadingChildren(false);
      }
    }
  }, [isOpen, previewNode, sessionId, currentLevel, node.id, treeNodes]);

  // 2. Fetch Alternatives (keep same)
  useEffect(() => {
    if (isOpen && node.id) {
      setLoadingAlternatives(true);
      const gateway = new SkillTreeHttpGateway();
      const name = node.fullName || node.label;
      
      gateway.getNodeAlternatives(node.id, node.level, sessionId, name)
        .then((data) => setAlternatives(data))
        .catch(err => console.error(err))
        .finally(() => setLoadingAlternatives(false));
    }
  }, [isOpen, node, sessionId]);

  const handlePreviewAlternative = (alt: AlternativeNode) => {
      const mapped: any = {
          id: alt.id,
          label: alt.name,
          fullName: alt.name,
          name: alt.name,
          type: alt.type || 'skill',
          level: (node.level),
          description: alt.description,
          children: alt.children
      };
      setPreviewNode(mapped);
  };

  const handleSwap = async (originalId: string, newNode: any) => {
      // ... (keep logic same)
      if (!sessionId) return;
      if (confirm(`Swap "${node.label}" with "${newNode.name || newNode.label}"?`)) {
        setIsSwapping(true);
        const gateway = new SkillTreeHttpGateway();
        const payload = {
            id: newNode.id,
            name: newNode.name || newNode.label || newNode.fullName,
            description: newNode.description,
            type: newNode.type,
            level: newNode.level,
            metadata: newNode.metadata || {},
            // Backend handles children generation logic
        };
        const result = await gateway.swapNode(sessionId, originalId, payload);
        setIsSwapping(false);
        if (result) {
            if (onNodeUpdated) onNodeUpdated();
            else window.location.reload();
            onClose();
        } else {
            alert("Failed to swap.");
        }
      }
  };

  if (!isOpen) return null;

  return (
    <div className="management-modal-overlay">
      <div className="management-modal">
        {/* Header */}
        <div className="modal-header">
           <div className="header-left">
             <div className="header-icon"><Settings size={20} color="#6366f1" /></div>
             <div>
               <h2>Node Management</h2>
               <p>{isPreviewingOriginal ? "Viewing current node details" : "Previewing alternative node details"}</p>
             </div>
           </div>
           <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {/* Left Column */}
          <div className="col-left">
            <div className="section-header">
              <span className="info-icon">i</span>
              <h3>GENERAL INFORMATION</h3>
            </div>
            
            <div className="form-group">
              <label>Node Title</label>
              <div className="modal-input read-only">{title}</div>
            </div>
            <div className="form-group">
                <label>Description</label>
                <div className="modal-textarea read-only text-sm">{description}</div>
            </div>

            {/* Hierarchy Tree Visual */}
            <div className="hierarchy-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div className="hierarchy-header">
                <div className="section-header no-margin">
                  <span className="hierarchy-icon">⚡</span>
                  <h3>HIERARCHY PREVIEW</h3>
                </div>
              </div>

              <div className="tree-visual" style={{ overflowY: 'auto', paddingLeft: '10px' }}>
                {/* Root */}
                <div className={`tree-node root-node ${!isPreviewingOriginal ? 'preview-mode' : ''}`}>
                   <div className="node-icon bg-purple">{isPreviewingOriginal ? '📁' : '👁️'}</div>
                   <div className="node-details">
                     <h4>{title}</h4>
                     <span>ROOT</span>
                   </div>
                   {!isPreviewingOriginal && (
                      <button onClick={() => setPreviewNode(node)} className="btn-xs-primary ml-auto">Reset</button>
                   )}
                </div>

                {/* Recursive Children */}
                <div className="tree-children-root" style={{ 
                    position: 'relative', 
                    marginLeft: '26px', 
                    borderLeft: children.length > 0 ? '1px solid #e2e8f0' : 'none' 
                }}>
                    {loadingChildren ? (
                        <div className="loading-placeholder p-4">Loading structure...</div>
                    ) : children.length > 0 ? (
                        children.map((child, idx) => (
                             <div key={child.id} style={{ position: 'relative' }}>
                                 {/* Vertical line segment */}
                                 <div style={{
                                     position: 'absolute',
                                     left: '-1px', // On top of borderLeft
                                     top: '0',
                                     bottom: idx === children.length - 1 ? 'calc(100% - 24px)' : '0',
                                     width: '1px',
                                     backgroundColor: '#e2e8f0' // Cover lower part if last item
                                 }}></div>
                                 <div style={ idx === children.length - 1 ? { backgroundColor: '#fff', position: 'absolute', left: '-1px', top: '24px', bottom: 0, width: '2px'} : {} }></div>

                                <RecursiveTreeItem node={child} isLast={idx === children.length - 1} />
                             </div>
                        ))
                    ) : (
                        <div className="empty-children p-4 text-slate-400 text-sm">No sub-nodes found.</div>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Alternatives) - Kept mostly same structure */}
            <div className="col-right">
            <div className="right-header">
              <div className="section-header no-margin">
                <span className="link-icon">🔄</span>
                <h3>ALTERNATIVE NODES</h3>
              </div>
            </div>

            <div className="cards-list">
              {loadingAlternatives ? (
                <div className="loading-placeholder">Searching alternatives...</div>
              ) : alternatives.length > 0 ? (
                alternatives.map((alt) => {
                  const isActive = previewNode.id === alt.id;
                  return (
                    <div 
                        key={alt.id} 
                        className={`related-card ${isActive ? 'active-card' : ''}`}
                        onClick={() => handlePreviewAlternative(alt)}
                    >
                        <div className="card-top">
                        <div className="card-icon-box bg-purple-light">{isActive ? '👁️' : '💡'}</div>
                        <div className="card-info">
                            <h4 style={{ color: isActive ? '#4f46e5' : '#0f172a' }}>{alt.name}</h4>
                            <span>{Math.round((alt.similarity_score || 0) * 100)}% Match</span>
                        </div>
                        </div>
                        {alt.description && <p className="alt-desc">{alt.description}</p>}
                        <div className="card-bottom">
                            <div className="flex gap-2">
                                <button 
                                    className="swap-btn-small" 
                                    disabled={isSwapping}
                                    onClick={(e) => { e.stopPropagation(); handleSwap(node.id, alt); }}
                                >
                                    {isSwapping ? '...' : 'Swap'}
                                </button>
                            </div>
                        </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state-card"><p>No suitable alternatives found.</p></div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
           <button className="btn-text" onClick={onClose}>Close</button>
           {!isPreviewingOriginal && (
              <button 
                className="swap-btn-small px-4 py-2" 
                disabled={isSwapping}
                onClick={() => handleSwap(node.id, previewNode)}
              >
                  Confirm Swap
              </button>
           )}
        </div>
      </div>
    </div>
  );
};
