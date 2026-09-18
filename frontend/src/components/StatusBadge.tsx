import React from 'react';
import { Clock, Eye, Wrench, CheckCircle2 } from 'lucide-react';
import type { ReportStatus } from '../types';

interface StatusBadgeProps {
  status: ReportStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getConfig = () => {
    switch (status) {
      case 'Submitted':
        return {
          icon: Clock,
          className: 'status-badge-submitted',
          label: 'Submitted',
        };
      case 'Under Review':
        return {
          icon: Eye,
          className: 'status-badge-review',
          label: 'Under Review',
        };
      case 'Action Taken':
        return {
          icon: Wrench,
          className: 'status-badge-action',
          label: 'Action Taken',
        };
      case 'Resolved':
        return {
          icon: CheckCircle2,
          className: 'status-badge-resolved',
          label: 'Resolved',
        };
      default:
        return {
          icon: Clock,
          className: 'status-badge-submitted',
          label: status,
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;

  return (
    <span className={`status-badge ${config.className} size-${size}`}>
      <Icon size={iconSize} className="status-badge-icon" />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
