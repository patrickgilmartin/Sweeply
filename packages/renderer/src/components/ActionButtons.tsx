import React, { useEffect } from 'react';
import { useKeyboard } from '../hooks/useKeyboard';

interface ActionButtonsProps {
  onKeep: () => void;
  onReject: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onKeep, onReject }) => {
  useKeyboard({
    onKeep,
    onReject
  });

  return (
    <div className="action-buttons">
      <button
        onClick={onReject}
        className="btn btn-reject"
        aria-label="Reject file"
      >
        <span className="btn-icon">❌</span>
        <span className="btn-text">REJECT</span>
      </button>
      <button
        onClick={onKeep}
        className="btn btn-keep"
        aria-label="Keep file"
      >
        <span className="btn-icon">✓</span>
        <span className="btn-text">KEEP</span>
      </button>
    </div>
  );
};

export default ActionButtons;
