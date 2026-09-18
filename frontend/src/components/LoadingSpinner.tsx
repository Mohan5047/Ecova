import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading ECOVA data...',
  size = 'md',
}) => {
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 36 : 24;

  return (
    <div className={`loading-spinner-wrapper size-${size}`}>
      <Loader2 size={iconSize} className="spinner-icon" />
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line skeleton-text" />
      <div className="skeleton-line skeleton-subtext" />
    </div>
  );
};

export default LoadingSpinner;
