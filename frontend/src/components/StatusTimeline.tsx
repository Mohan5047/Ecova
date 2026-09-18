import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Eye, Wrench, CheckCircle2 } from 'lucide-react';
import type { ReportStatus, StatusHistoryItem } from '../types';

interface StatusTimelineProps {
  currentStatus: ReportStatus;
  history: StatusHistoryItem[];
  createdAt: string;
}

const STAGES: { status: ReportStatus; title: string; defaultDesc: string; icon: React.ElementType }[] = [
  {
    status: 'Submitted',
    title: 'Report Submitted',
    defaultDesc: 'Your report was received with photo and location evidence.',
    icon: Camera,
  },
  {
    status: 'Under Review',
    title: 'Authority Reviewing',
    defaultDesc: 'The responsible municipal or civic department is reviewing the issue.',
    icon: Eye,
  },
  {
    status: 'Action Taken',
    title: 'Action Taken',
    defaultDesc: 'Field crew or maintenance contractor deployed on-site.',
    icon: Wrench,
  },
  {
    status: 'Resolved',
    title: 'Issue Resolved',
    defaultDesc: 'Remediation completed and verified for community safety.',
    icon: CheckCircle2,
  },
];

const ORDER: Record<ReportStatus, number> = {
  'Submitted': 0,
  'Under Review': 1,
  'Action Taken': 2,
  'Resolved': 3,
};

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ currentStatus, history, createdAt }) => {
  const currentStepIndex = ORDER[currentStatus] ?? 0;

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="status-timeline-card">
      <div className="timeline-header">
        <h3>Report Progress Timeline</h3>
        <span className="timeline-date">Started {formatDate(createdAt)}</span>
      </div>

      <div className="timeline-container">
        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isFuture = index > currentStepIndex;

          // Find specific history entry matching this stage if available
          const matchingHistory = history.find((h) => h.status === stage.status);
          const timestamp = matchingHistory?.timestamp || (index === 0 ? createdAt : undefined);
          const note = matchingHistory?.note || stage.defaultDesc;
          const updatedBy = matchingHistory?.updatedBy;

          return (
            <motion.div
              key={stage.status}
              className={`timeline-step ${isCurrent ? 'step-current' : ''} ${
                isCompleted ? 'step-completed' : ''
              } ${isFuture ? 'step-future' : ''}`}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: index * 0.1 }}
            >
              <div className="step-indicator-wrapper">
                <div className={`step-dot ${isCurrent ? 'pulse' : ''}`}>
                  <Icon size={16} />
                </div>
                {index < STAGES.length - 1 && (
                  <div className={`step-connector ${isCompleted ? 'connector-filled' : ''}`} />
                )}
              </div>

              <div className="step-details">
                <div className="step-title-row">
                  <h4>{stage.title}</h4>
                  {timestamp && <span className="step-time">{formatDate(timestamp)}</span>}
                </div>
                <p className="step-desc">{note}</p>
                {updatedBy && (
                  <span className="step-author">
                    Action by: <strong>{updatedBy}</strong>
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;
