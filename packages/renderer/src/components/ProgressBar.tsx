import React from 'react';

interface ProgressBarProps {
  stats: {
    total: number;
    pending: number;
    kept: number;
    rejected: number;
  };
}

const ProgressBar: React.FC<ProgressBarProps> = ({ stats }) => {
  const reviewed = stats.total - stats.pending;
  const percentage = stats.total > 0 ? (reviewed / stats.total) * 100 : 0;

  return (
    <div className="progress-container">
      <div className="progress-info">
        <span className="progress-text">
          {reviewed} of {stats.total} reviewed
        </span>
        <span className="progress-stats">
          ✓ {stats.kept} | ❌ {stats.rejected} | ⏳ {stats.pending}
        </span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
