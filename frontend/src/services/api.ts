import type { Report, User, Notification, ReportStatus, DashboardStats } from '../types';
import { socketService } from './socket';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'ecova_auth_token';

// Helpers to format statuses between backend (UPPERCASE) and frontend (Title Case)
function normalizeStatus(backendStatus: string): ReportStatus {
  const map: Record<string, ReportStatus> = {
    SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review',
    ACTION_TAKEN: 'Action Taken',
    RESOLVED: 'Resolved',
    REJECTED: 'Resolved', // Friendly representation
  };
  return map[backendStatus?.toUpperCase()] || 'Submitted';
}

function toBackendStatus(frontendStatus: string): string {
  const map: Record<string, string> = {
    Submitted: 'SUBMITTED',
    'Under Review': 'UNDER_REVIEW',
    'Action Taken': 'ACTION_TAKEN',
    Resolved: 'RESOLVED',
  };
  return map[frontendStatus] || frontendStatus.toUpperCase();
}

function normalizeUser(raw: any): User {
  return {
    id: raw.id,
    name: raw.full_name || raw.name || 'Citizen',
    email: raw.email,
    phone: raw.phone || undefined,
    role: (raw.role || 'CITIZEN').toLowerCase() as any,
    department: raw.department || undefined,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  };
}

function normalizeReport(raw: any): Report {
  const history = (raw.statusHistory || []).map((h: any) => ({
    status: normalizeStatus(h.status),
    timestamp: h.created_at || h.timestamp || new Date().toISOString(),
    note: h.note || '',
    updatedBy: h.changed_by_name || h.updatedBy || 'Authority',
  }));

  return {
    id: raw.report_code || raw.id?.toString(),
    category: raw.category_name || raw.category || 'General',
    description: raw.description,
    severity: (raw.severity?.charAt(0).toUpperCase() + raw.severity?.slice(1).toLowerCase()) as any,
    latitude: parseFloat(raw.latitude),
    longitude: parseFloat(raw.longitude),
    address: raw.address || undefined,
    photoUrl: raw.photo_url
      ? raw.photo_url.startsWith('http')
        ? raw.photo_url
        : `${import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'}${raw.photo_url}`
      : undefined,
    status: normalizeStatus(raw.status),
    statusHistory: history,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString(),
    userId: raw.user_id || raw.userId,
    citizenName: raw.citizen_name || raw.citizenName,
    assignedAuthority: raw.authority_name || raw.assignedAuthority,
    actionNotes: raw.actions && raw.actions.length > 0 ? raw.actions[0].note : raw.actionNotes,
  };
}

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Centralized HTTP request helper
   */
  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // If body is NOT FormData, default to application/json
    if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401) {
        // Token invalid or expired
        this.removeToken();
        socketService.disconnect();
      }
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  },

  // ==========================================
  // AUTH
  // ==========================================
  async login(email: string, password: string): Promise<User> {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.data?.token) {
      this.setToken(res.data.token);
      socketService.connect(res.data.user.id);
    }

    return normalizeUser(res.data.user);
  },

  async register(name: string, email: string, password: string, phone?: string): Promise<User> {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: name,
        email,
        password,
        phone,
      }),
    });

    if (res.data?.token) {
      this.setToken(res.data.token);
      socketService.connect(res.data.user.id);
    }

    return normalizeUser(res.data.user);
  },

  async getProfile(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await this.request('/auth/me');
      if (res.data) {
        socketService.connect(res.data.id);
        return normalizeUser(res.data);
      }
      return null;
    } catch {
      return null;
    }
  },

  async updateProfile(updates: { fullName?: string; phone?: string; profileImage?: string }): Promise<User> {
    const res = await this.request('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return normalizeUser(res.data);
  },

  logout(): void {
    this.removeToken();
    socketService.disconnect();
  },

  // ==========================================
  // REPORTS
  // ==========================================
  async createReport(formData: FormData | {
    category: string;
    description: string;
    severity: 'Low' | 'Medium' | 'High';
    latitude: number;
    longitude: number;
    address?: string;
    photoUrl?: string;
  }): Promise<Report> {
    let body: any;
    if (formData instanceof FormData) {
      body = formData;
    } else {
      body = JSON.stringify({
        category: formData.category,
        description: formData.description,
        severity: formData.severity.toUpperCase(),
        latitude: formData.latitude,
        longitude: formData.longitude,
        address: formData.address,
        photoUrl: formData.photoUrl,
      });
    }

    const res = await this.request('/reports', {
      method: 'POST',
      body,
    });

    return normalizeReport(res.data);
  },

  async getReports(filters?: { status?: string; category?: string; search?: string }): Promise<Report[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', toBackendStatus(filters.status));
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request(`/reports${qs}`);
    return (res.data || []).map(normalizeReport);
  },

  async getMyReports(filters?: { status?: string; category?: string; search?: string }): Promise<Report[]> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'All') params.append('status', toBackendStatus(filters.status));
    if (filters?.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request(`/reports/my${qs}`);
    return (res.data || []).map(normalizeReport);
  },

  async getReport(id: string): Promise<Report | null> {
    try {
      const res = await this.request(`/reports/${id}`);
      return res.data ? normalizeReport(res.data) : null;
    } catch {
      return null;
    }
  },

  async getReportByCode(reportCode: string): Promise<Report | null> {
    try {
      const res = await this.request(`/reports/code/${encodeURIComponent(reportCode.trim())}`);
      return res.data ? normalizeReport(res.data) : null;
    } catch {
      return null;
    }
  },

  async updateReportStatus(
    id: string,
    status: ReportStatus,
    note: string,
    _updatedBy?: string,
    actionNotes?: string
  ): Promise<Report | null> {
    // Determine internal numeric id or code
    const res = await this.request(`/reports/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: toBackendStatus(status),
        note,
      }),
    });

    if (actionNotes) {
      await this.addReportAction(id, 'NOTE', actionNotes).catch(() => {});
    }

    return res.data ? normalizeReport(res.data) : null;
  },

  async addReportAction(id: string, actionType: string, note: string): Promise<any> {
    const res = await this.request(`/reports/${id}/actions`, {
      method: 'POST',
      body: JSON.stringify({ actionType, note }),
    });
    return res.data;
  },

  // ==========================================
  // DASHBOARDS
  // ==========================================
  async getCitizenDashboard(): Promise<{ metrics: DashboardStats; recentReports: Report[] }> {
    const res = await this.request('/dashboard');
    return {
      metrics: res.data?.metrics || { totalReports: 0, underReview: 0, actionTaken: 0, resolved: 0 },
      recentReports: (res.data?.recentReports || []).map(normalizeReport),
    };
  },

  async getAuthorityDashboard(filters?: { status?: string; severity?: string; category?: string; search?: string }): Promise<{
    metrics: {
      totalAssigned: number;
      submitted: number;
      underReview: number;
      actionTaken: number;
      resolved: number;
      highSeverity: number;
    };
    reports: Report[];
  }> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'All') params.append('status', toBackendStatus(filters.status));
    if (filters?.severity && filters.severity !== 'All') params.append('severity', filters.severity.toUpperCase());
    if (filters?.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request(`/authority/reports${qs}`);

    return {
      metrics: res.data?.metrics || {
        totalAssigned: 0,
        submitted: 0,
        underReview: 0,
        actionTaken: 0,
        resolved: 0,
        highSeverity: 0,
      },
      reports: (res.data?.reports || []).map(normalizeReport),
    };
  },

  async getAdminStats(): Promise<{
    metrics: {
      totalUsers: number;
      citizensCount: number;
      authoritiesCount: number;
      adminsCount: number;
      totalReports: number;
      openReports: number;
      resolvedReports: number;
      highSeverityReports: number;
    };
    breakdowns: {
      byCategory: { name: string; count: number }[];
      byStatus: { status: string; count: number }[];
      bySeverity: { severity: string; count: number }[];
    };
    recentActivity: any[];
  }> {
    const res = await this.request('/admin/stats');
    return res.data;
  },

  async getAdminUsers(role?: string, search?: string): Promise<User[]> {
    const params = new URLSearchParams();
    if (role && role !== 'All') params.append('role', role);
    if (search) params.append('search', search);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request(`/admin/users${qs}`);
    return (res.data || []).map(normalizeUser);
  },

  async toggleUserStatus(id: string): Promise<any> {
    const res = await this.request(`/admin/users/${id}/toggle-status`, {
      method: 'PATCH',
    });
    return res.data;
  },

  async createAuthority(data: { fullName: string; email: string; phone?: string; password: string }): Promise<User> {
    const res = await this.request('/admin/authority', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return normalizeUser(res.data);
  },

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  async getNotifications(): Promise<Notification[]> {
    try {
      const res = await this.request('/notifications');
      return (res.data || []).map((n: any) => ({
        id: n.id?.toString(),
        userId: n.user_id,
        title: n.title,
        message: n.message,
        createdAt: n.created_at,
        read: n.is_read,
        type: n.type?.toLowerCase() === 'action' ? 'warning' : n.type?.toLowerCase() === 'resolved' ? 'success' : 'info',
      }));
    } catch {
      return [];
    }
  },

  async markNotificationRead(id: string): Promise<void> {
    await this.request(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  async markAllNotificationsRead(): Promise<void> {
    await this.request('/notifications/read-all', { method: 'PATCH' });
  },

  // ==========================================
  // CATEGORIES
  // ==========================================
  async getCategories(): Promise<{ id: number; name: string; description: string; icon: string }[]> {
    try {
      const res = await this.request('/categories');
      return res.data || [];
    } catch {
      return [];
    }
  },
};
