import type { Report, User, Notification, ReportStatus, DashboardStats } from '../types';
import { INITIAL_REPORTS, INITIAL_USERS, INITIAL_NOTIFICATIONS } from '../data/mockData';

const STORAGE_KEYS = {
  REPORTS: 'ecova_reports_v1',
  USERS: 'ecova_users_v1',
  CURRENT_USER: 'ecova_current_user_v1',
  NOTIFICATIONS: 'ecova_notifications_v1',
};

// Initialize localStorage with seed data if not present
function initializeStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_REPORTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    // Default to the citizen demo user
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }
}

// Ensure storage initialized on module load
initializeStorage();

export const storageService = {
  // REPORTS
  getReports(): Report[] {
    initializeStorage();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
      return data ? JSON.parse(data) : INITIAL_REPORTS;
    } catch {
      return INITIAL_REPORTS;
    }
  },

  getReportById(id: string): Report | null {
    const reports = this.getReports();
    const cleanId = id.trim().toUpperCase();
    return reports.find((r) => r.id.toUpperCase() === cleanId) || null;
  },

  getUserReports(userId: string): Report[] {
    const reports = this.getReports();
    return reports.filter((r) => r.userId === userId);
  },

  saveReport(newReportData: {
    category: string;
    description: string;
    severity: 'Low' | 'Medium' | 'High';
    latitude: number;
    longitude: number;
    address?: string;
    photoUrl?: string;
    userId?: string;
    citizenName?: string;
  }): Report {
    const reports = this.getReports();
    const now = new Date().toISOString();
    
    // Generate clean unique report ID
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const newId = `ECOVA-${randomDigits}`;

    const report: Report = {
      id: newId,
      category: newReportData.category,
      description: newReportData.description,
      severity: newReportData.severity,
      latitude: newReportData.latitude,
      longitude: newReportData.longitude,
      address: newReportData.address || `${newReportData.latitude.toFixed(4)}, ${newReportData.longitude.toFixed(4)}`,
      photoUrl: newReportData.photoUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
      status: 'Submitted',
      statusHistory: [
        {
          status: 'Submitted',
          timestamp: now,
          note: 'Report submitted by citizen with photo evidence and location pin.',
          updatedBy: newReportData.citizenName || 'Citizen',
        },
      ],
      createdAt: now,
      updatedAt: now,
      userId: newReportData.userId || 'usr-1',
      citizenName: newReportData.citizenName || 'Citizen',
    };

    reports.unshift(report);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));

    // Create confirmation notification
    this.addNotification({
      userId: report.userId,
      title: `Report ${report.id} Submitted`,
      message: `Your report regarding "${report.category}" was received and queued for review.`,
      reportId: report.id,
      type: 'info',
    });

    return report;
  },

  updateReportStatus(
    reportId: string,
    status: ReportStatus,
    note: string,
    updatedBy?: string,
    actionNotes?: string
  ): Report | null {
    const reports = this.getReports();
    const index = reports.findIndex((r) => r.id.toUpperCase() === reportId.trim().toUpperCase());
    if (index === -1) return null;

    const now = new Date().toISOString();
    const current = reports[index];

    const updatedHistory = [
      ...current.statusHistory,
      {
        status,
        timestamp: now,
        note: note || `Status updated to ${status}`,
        updatedBy: updatedBy || 'Responsible Authority',
      },
    ];

    const updatedReport: Report = {
      ...current,
      status,
      statusHistory: updatedHistory,
      updatedAt: now,
      actionNotes: actionNotes !== undefined ? actionNotes : current.actionNotes,
    };

    reports[index] = updatedReport;
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));

    // Create notification for citizen
    this.addNotification({
      userId: updatedReport.userId,
      title: `Report ${updatedReport.id} — ${status}`,
      message: note || `Your report status is now marked as "${status}".`,
      reportId: updatedReport.id,
      type: status === 'Resolved' ? 'success' : 'info',
    });

    return updatedReport;
  },

  // USERS & AUTH
  getUsers(): User[] {
    initializeStorage();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  },

  getCurrentUser(): User | null {
    initializeStorage();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  updateUserProfile(userId: string, updates: { name?: string; phone?: string; department?: string }): User | null {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return null;

    const updatedUser: User = {
      ...users[idx],
      ...updates,
    };
    users[idx] = updatedUser;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.setCurrentUser(updatedUser);
    }

    return updatedUser;
  },

  // NOTIFICATIONS
  getNotifications(userId?: string): Notification[] {
    initializeStorage();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const allNotifs: Notification[] = data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
      if (userId) {
        return allNotifs.filter((n) => !n.userId || n.userId === userId);
      }
      return allNotifs;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  addNotification(notifData: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification {
    const notifs = this.getNotifications();
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      read: false,
      ...notifData,
    };
    notifs.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    return newNotif;
  },

  markNotificationAsRead(id: string): void {
    const notifs = this.getNotifications();
    const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  },

  markAllNotificationsAsRead(userId?: string): void {
    const notifs = this.getNotifications();
    const updated = notifs.map((n) => {
      if (!userId || n.userId === userId) {
        return { ...n, read: true };
      }
      return n;
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  },

  // STATS
  getStats(): DashboardStats & { totalUsers: number; authoritiesCount: number } {
    const reports = this.getReports();
    const users = this.getUsers();

    return {
      totalReports: reports.length,
      underReview: reports.filter((r) => r.status === 'Under Review').length,
      actionTaken: reports.filter((r) => r.status === 'Action Taken').length,
      resolved: reports.filter((r) => r.status === 'Resolved').length,
      totalUsers: users.length,
      authoritiesCount: users.filter((u) => u.role === 'authority').length,
    };
  },
};
