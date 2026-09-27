import React from 'react';
import { Bell, CheckCheck, X, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../types';

interface NotificationPanelProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
  onNotificationClick: (id: string, reportId?: string) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAllRead,
  onNotificationClick,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleClick = (notif: Notification) => {
    onNotificationClick(notif.id, notif.reportId);
    const codeMatch = notif.title.match(/ECOVA-\d+/i) || notif.message.match(/ECOVA-\d+/i);
    const targetCode = notif.reportId || (codeMatch ? codeMatch[0] : null);
    if (targetCode) {
      navigate(`/tracking?id=${targetCode}`);
      onClose();
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} className="notif-type-success" />;
      case 'warning':
        return <AlertCircle size={16} className="notif-type-warning" />;
      default:
        return <Info size={16} className="notif-type-info" />;
    }
  };

  return (
    <div className="notification-panel-overlay" onClick={onClose}>
      <div
        className="notification-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="notif-header">
          <div className="notif-title">
            <Bell size={18} />
            <h3>Notifications</h3>
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="notif-count-badge">
                {notifications.filter((n) => !n.read).length} new
              </span>
            )}
          </div>
          <div className="notif-actions">
            <button
              type="button"
              className="mark-all-btn"
              onClick={onMarkAllRead}
              title="Mark all as read"
            >
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>
            <button
              type="button"
              className="notif-close-btn"
              onClick={onClose}
              aria-label="Close notifications"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="notif-list">
          {notifications.length === 0 ? (
            <div className="notif-empty">
              <Bell size={28} className="empty-bell" />
              <p>No notifications yet</p>
              <span>You'll be updated as your reports progress</span>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`notif-item ${!notif.read ? 'notif-unread' : ''}`}
                onClick={() => handleClick(notif)}
              >
                <div className="notif-icon-col">{getIcon(notif.type)}</div>
                <div className="notif-body">
                  <div className="notif-subject">
                    <strong>{notif.title}</strong>
                    {!notif.read && <span className="unread-dot" />}
                  </div>
                  <p>{notif.message}</p>
                  <span className="notif-timestamp">{formatTime(notif.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
