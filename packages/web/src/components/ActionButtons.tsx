import React, { useEffect } from 'react';

interface ActionButtonsProps {
  onKeep: () => void;
  onReject: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onKeep, onReject }) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        onReject();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        onKeep();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onKeep, onReject]);

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
