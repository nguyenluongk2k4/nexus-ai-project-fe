import React from 'react';
import './NodeTooltip.css';

interface NodeTooltipProps {
  node: {
    label: string;
    fullName?: string;
    nodeData?: {
      type?: string;
      description?: string;
      metadata?: {
        difficultyLevel?: string;
        estimatedHours?: number;
      };
    };
    level: number;
  };
  position: { x: number; y: number };
  progress?: number; // 0-100
}

export const NodeTooltip: React.FC<NodeTooltipProps> = ({ node, position, progress }) => {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return '#34d399';
      case 'intermediate': return '#fbbf24';
      case 'advanced': return '#f87171';
      default: return '#94a3b8';
    }
  };

  const getTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'ability': return '🎯';
      case 'skill': return '⚙️';
      case 'knowledge': return '📚';
      default: return '🔵';
    }
  };

  return (
    <div 
      className="node-tooltip"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      {/* Header with icon and name */}
      <div className="tooltip-header">
        <span className="tooltip-icon">{getTypeIcon(node.nodeData?.type)}</span>
        <h3 className="tooltip-title">{node.fullName || node.label}</h3>
      </div>

      {/* Progress badge if available */}
      {progress !== undefined && (
        <div className="tooltip-progress">
          <span className="progress-badge">
            ACTIVE PATH
          </span>
          <span className="progress-value">{progress}% Overall</span>
        </div>
      )}

      {/* Description */}
      {node.nodeData?.description && (
        <p className="tooltip-description">
          {node.nodeData.description}
        </p>
      )}

      {/* Metadata */}
      <div className="tooltip-metadata">
        {node.nodeData?.metadata?.difficultyLevel && (
          <div className="metadata-item">
            <span className="metadata-icon" style={{ color: getDifficultyColor(node.nodeData.metadata.difficultyLevel) }}>
              ●
            </span>
            <span className="metadata-label">DIFFICULTY</span>
            <span className="metadata-value">
              {node.nodeData.metadata.difficultyLevel}
            </span>
          </div>
        )}

        {node.nodeData?.metadata?.estimatedHours && (
          <div className="metadata-item">
            <span className="metadata-icon">⏱️</span>
            <span className="metadata-label">EST. TIME</span>
            <span className="metadata-value">
              {node.nodeData.metadata.estimatedHours} Months
            </span>
          </div>
        )}

        <div className="metadata-item">
          <span className="metadata-icon">⭐</span>
          <span className="metadata-label">IMPORTANCE</span>
          <span className="metadata-value">High</span>
        </div>
      </div>

      {/* Hint */}
      <div className="tooltip-hint">
        Click for more details
      </div>
    </div>
  );
};
