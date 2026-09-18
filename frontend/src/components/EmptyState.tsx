import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="empty-state-card">
      <div className="empty-state-icon">
        <Icon size={32} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionText && (
        <div className="empty-state-action">
          {actionLink ? (
            <Link to={actionLink} className="primary-button">
              {actionText}
            </Link>
          ) : onAction ? (
            <button type="button" className="primary-button" onClick={onAction}>
              {actionText}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
