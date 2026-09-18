export type UserRole = 'citizen' | 'authority' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  department?: string;
  createdAt: string;
}

export type ReportStatus = 'Submitted' | 'Under Review' | 'Action Taken' | 'Resolved';

export type Severity = 'Low' | 'Medium' | 'High';

export type IssueCategory =
  | 'Waste & Garbage'
  | 'Water Issue'
  | 'Pollution'
  | 'Nature & Greenery'
  | 'Public Surroundings'
  | 'Other';

export interface StatusHistoryItem {
  status: ReportStatus;
  timestamp: string;
  note: string;
  updatedBy?: string;
}

export interface Report {
  id: string;
  category: string;
  description: string;
  severity: Severity;
  latitude: number;
  longitude: number;
  address?: string;
  photoUrl?: string;
  status: ReportStatus;
  statusHistory: StatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
  userId?: string;
  citizenName?: string;
  assignedAuthority?: string;
  actionNotes?: string;
}

export interface Notification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  reportId?: string;
  type?: 'info' | 'success' | 'warning';
}

export interface DashboardStats {
  totalReports: number;
  underReview: number;
  actionTaken: number;
  resolved: number;
}
