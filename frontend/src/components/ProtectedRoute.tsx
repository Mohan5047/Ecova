import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated, switchDemoRole } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <LoadingSpinner message="Verifying session..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="report-page">
        <main className="report-container">
          <div className="empty-state-card" style={{ maxWidth: '560px', margin: '40px auto' }}>
            <div className="empty-state-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <ShieldAlert size={34} />
            </div>
            <h3>Access Restricted</h3>
            <p>
              This section is reserved for <strong>{allowedRoles.join(' / ')}</strong> accounts.
              You are currently signed in as <strong>{user.name} ({user.role})</strong>.
            </p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {allowedRoles.includes('authority') && (
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => switchDemoRole('authority')}
                >
                  Switch to Authority Demo
                </button>
              )}
              {allowedRoles.includes('admin') && (
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => switchDemoRole('admin')}
                >
                  Switch to Admin Demo
                </button>
              )}
              <Link to="/dashboard" className="secondary-button">
                Return to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
