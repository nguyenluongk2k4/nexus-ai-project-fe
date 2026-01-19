import React, { useState, useEffect } from 'react';
import './SwapNodeModal.css';

interface AlternativeNode {
  id: string;
  name: string;
  description?: string;
  similarity_score: number;
  estimated_impact?: {
    skills_count: number;
    knowledge_count: number;
  };
}

interface SwapNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNode: {
    id: string;
    name: string;
    type: string;
    level: number;
  };
  impact: {
    affected_children: number;
    skills_count: number;
    knowledge_count: number;
  };
  alternatives: AlternativeNode[];
  onConfirmSwap: (newNodeId: string) => void;
  loading?: boolean;
}

export const SwapNodeModal: React.FC<SwapNodeModalProps> = ({
  isOpen,
  onClose,
  currentNode,
  impact,
  alternatives,
  onConfirmSwap,
  loading = false
}) => {
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedAlternative(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedAlternative) {
      onConfirmSwap(selectedAlternative);
    }
  };

  const getWarningLevel = () => {
    if (currentNode.level === 1) return 'high';
    if (currentNode.level === 2) return 'medium';
    return 'low';
  };

  const warningLevel = getWarningLevel();

  return (
    <div className="swap-modal-overlay" onClick={onClose}>
      <div className="swap-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="swap-modal-header">
          <h2>🔄 Thay thế Node</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Current Node */}
        <div className="current-node-section">
          <h3>📌 Node hiện tại:</h3>
          <div className="current-node-card">
            <div className="node-name">{currentNode.name}</div>
            <div className="node-info">
              Level: {currentNode.type} ({currentNode.level})
            </div>
          </div>
        </div>

        {/* Warning */}
        {impact.affected_children > 0 && (
          <div className={`warning-section warning-${warningLevel}`}>
            <span className="warning-icon">⚠️</span>
            <div className="warning-text">
              {warningLevel === 'high' && (
                <strong>Cảnh báo: Thay đổi lớn! </strong>
              )}
              Thay đổi này sẽ ảnh hưởng <strong>{impact.affected_children} nodes</strong>
              {impact.skills_count > 0 && ` (${impact.skills_count} skills`}
              {impact.knowledge_count > 0 && `, ${impact.knowledge_count} knowledge)`}
            </div>
          </div>
        )}

        {/* Alternatives */}
        <div className="alternatives-section">
          <h3>🔍 Gợi ý thay thế:</h3>
          
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Đang tìm kiếm alternatives...</p>
            </div>
          ) : alternatives.length === 0 ? (
            <div className="empty-state">
              <p>Không tìm thấy node thay thế phù hợp</p>
            </div>
          ) : (
            <div className="alternatives-list">
              {alternatives.map((alt) => (
                <label 
                  key={alt.id} 
                  className={`alternative-card ${selectedAlternative === alt.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="alternative"
                    value={alt.id}
                    checked={selectedAlternative === alt.id}
                    onChange={() => setSelectedAlternative(alt.id)}
                  />
                  <div className="alternative-content">
                    <div className="alternative-header">
                      <span className="alternative-name">{alt.name}</span>
                      <span className="similarity-badge">
                        {Math.round(alt.similarity_score * 100)}%
                      </span>
                    </div>
                    {alt.description && (
                      <p className="alternative-description">{alt.description}</p>
                    )}
                    {alt.estimated_impact && (
                      <div className="alternative-impact">
                        Impact: {alt.estimated_impact.skills_count} skills, 
                        {alt.estimated_impact.knowledge_count} knowledge
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button 
            className="btn-confirm" 
            onClick={handleConfirm}
            disabled={!selectedAlternative || loading}
          >
            Xác nhận Swap
          </button>
        </div>
      </div>
    </div>
  );
};
