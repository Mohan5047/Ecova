import { Request } from 'express';

export type UserRole = 'CITIZEN' | 'AUTHORITY' | 'ADMIN';

export type ReportStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ACTION_TAKEN'
  | 'RESOLVED'
  | 'REJECTED';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH';

export type NotificationType =
  | 'INFO'
  | 'STATUS_UPDATE'
  | 'ACTION'
  | 'RESOLVED'
  | 'SYSTEM';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  password_hash: string;
  role: UserRole;
  profile_image?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export type SafeUser = Omit<User, 'password_hash'>;

export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  created_at: Date;
}

export interface Report {
  id: number;
  report_code: string;
  user_id: string;
  category_id: number;
  description: string;
  severity: Severity;
  latitude: number;
  longitude: number;
  address?: string;
  photo_url?: string;
  status: ReportStatus;
  authority_id?: string;
  created_at: Date;
  updated_at: Date;
  resolved_at?: Date;
}

export interface StatusHistoryItem {
  id: number;
  report_id: number;
  status: ReportStatus;
  note?: string;
  changed_by?: string;
  changed_by_name?: string;
  created_at: Date;
}

export interface ReportAction {
  id: number;
  report_id: number;
  authority_id: string;
  authority_name?: string;
  action_type: string;
  note: string;
  created_at: Date;
}

export interface Notification {
  id: number;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: Date;
}

export interface ActivityLog {
  id: number;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

export interface AuthRequest extends Request {
  user?: SafeUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
