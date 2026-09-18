import type { Report, User, Notification, ReportStatus, DashboardStats } from '../types';
import { storageService } from './storageService';

// Backend URL configured via Vite environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * REST API client facade.
 * If VITE_API_URL is defined and active, it interacts with the backend.
 * Otherwise, it transparently operates with storageService to provide a realistic offline-first experience.
 */
export const api = {
  // AUTH
  async login(email: string, _password: string):Promise<User> {
    if (API_BASE_URL) {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: _password }),
      });
      if (!res.ok) throw new Error('Invalid credentials');
      return res.json();
    }

    // Mock login fallback
    const users = storageService.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) {
      // Auto-create as citizen if testing arbitrary email
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0],
        email: email.trim().toLowerCase(),
        role: 'citizen',
        createdAt: new Date().toISOString(),
      };
      storageService.setCurrentUser(newUser);
      return newUser;
    }
    storageService.setCurrentUser(found);
    return found;
  },

  async register(name: string, email: string, _password: string, phone?: string): Promise<User> {
    if (API_BASE_URL) {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: _password, phone }),
      });
      if (!res.ok) throw new Error('Registration failed');
      return res.json();
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email: email.trim().toLowerCase(),
      phone,
      role: 'citizen', // Default registration role is always Citizen
      createdAt: new Date().toISOString(),
    };
    storageService.setCurrentUser(newUser);
    return newUser;
  },

  async getProfile(): Promise<User | null> {
    if (API_BASE_URL) {
      const res = await fetch(`${API_BASE_URL}/auth/profile`);
      if (!res.ok) return null;
      return res.json();
    }
    return storageService.getCurrentUser();
  },

  // REPORTS
  async getReports(): Promise<Report[]> {
    if (API_BASE_URL) {
      const res = await fetch(`${API_BASE_URL}/reports`);
      if (!res.ok) throw new Error('Failed to load reports');
      return res.json();
    }
    return storageService.getReports();
  },

  async getReport(id: string): Promise<Report | null> {
    if (API_BASE_URL) {
      const res = await fetch(`${API_BASE_URL}/reports/${id}`);
      if (!res.ok) return null;
      return res.json();
    }
    return storageService.getReportById(id);
  },

  async createReport(reportData: {
    category: string;
    description: string;
    severity: 'Low' | 'Medium' | 'High';
    latitude: number;
    longitude: number;
    address?: string;
    photoUrl?: string;
    userId?: string;
    citizenName?: string;
  }): Promise<Report> {
    if (API_BASE_URL) {
      const res = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });
      if (!res.ok) throw new Error('Failed to create report');
      return res.json();
    }
    return storageService.saveReport(reportData);
  },

  async updateReportStatus(
    id: string,
    status: ReportStatus,
    note: string,
    updatedBy?: string,
    actionNotes?: string
  ): Promise<Report | null> {
    if (API_BASE_URL) {
      const res = await fetch(`${API_BASE_URL}/reports/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note, updatedBy, actionNotes }),
      });
      if (!res.ok) throw new Error('Failed to update report status');
      return res.json();
    }
    return storageService.updateReportStatus(id, status, note, updatedBy, actionNotes);
  },

  // NOTIFICATIONS
  async getNotifications(userId?: string): Promise<Notification[]> {
    if (API_BASE_URL) {
      const res = await fetch(`${API_BASE_URL}/notifications`);
      if (!res.ok) return [];
      return res.json();
    }
    return storageService.getNotifications(userId);
  },

  // STATS
  async getStats(): Promise<DashboardStats & { totalUsers: number; authoritiesCount: number }> {
    if (API_BASE_URL) {
      const res = await fetch(`${API_BASE_URL}/admin/stats`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    }
    return storageService.getStats();
  },
};
