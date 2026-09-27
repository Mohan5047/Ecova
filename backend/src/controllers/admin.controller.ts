import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/db';
import { AuthRequest, SafeUser } from '../types';

export const adminController = {
  /**
   * System-wide statistics and analytics for Admin Dashboard
   */
  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      // 1. User metrics
      const usersRes = await query<{
        total_users: string;
        citizens: string;
        authorities: string;
        admins: string;
      }>(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(*) FILTER (WHERE role = 'CITIZEN') as citizens,
          COUNT(*) FILTER (WHERE role = 'AUTHORITY') as authorities,
          COUNT(*) FILTER (WHERE role = 'ADMIN') as admins
        FROM users
      `);

      // 2. Report metrics
      const reportsRes = await query<{
        total_reports: string;
        open_reports: string;
        resolved_reports: string;
        high_severity: string;
      }>(`
        SELECT 
          COUNT(*) as total_reports,
          COUNT(*) FILTER (WHERE status != 'RESOLVED' AND status != 'REJECTED') as open_reports,
          COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved_reports,
          COUNT(*) FILTER (WHERE severity = 'HIGH' AND status != 'RESOLVED') as high_severity
        FROM reports
      `);

      // 3. Category breakdown
      const categoryRes = await query<{ name: string; count: string }>(`
        SELECT c.name, COUNT(r.id) as count
        FROM categories c
        LEFT JOIN reports r ON c.id = r.category_id
        GROUP BY c.id, c.name
        ORDER BY count DESC
      `);

      // 4. Status breakdown
      const statusRes = await query<{ status: string; count: string }>(`
        SELECT status, COUNT(*) as count
        FROM reports
        GROUP BY status
        ORDER BY count DESC
      `);

      // 5. Severity breakdown
      const severityRes = await query<{ severity: string; count: string }>(`
        SELECT severity, COUNT(*) as count
        FROM reports
        GROUP BY severity
        ORDER BY count DESC
      `);

      // 6. Recent activity logs
      const activityRes = await query(`
        SELECT l.*, u.full_name as user_name, u.email as user_email
        FROM activity_logs l
        LEFT JOIN users u ON l.user_id = u.id
        ORDER BY l.created_at DESC
        LIMIT 10
      `);

      const userStats = usersRes.rows[0];
      const reportStats = reportsRes.rows[0];

      res.status(200).json({
        success: true,
        message: 'Admin system statistics retrieved',
        data: {
          metrics: {
            totalUsers: parseInt(userStats.total_users, 10),
            citizensCount: parseInt(userStats.citizens, 10),
            authoritiesCount: parseInt(userStats.authorities, 10),
            adminsCount: parseInt(userStats.admins, 10),
            totalReports: parseInt(reportStats.total_reports, 10),
            openReports: parseInt(reportStats.open_reports, 10),
            resolvedReports: parseInt(reportStats.resolved_reports, 10),
            highSeverityReports: parseInt(reportStats.high_severity, 10),
          },
          breakdowns: {
            byCategory: categoryRes.rows.map((r) => ({ name: r.name, count: parseInt(r.count, 10) })),
            byStatus: statusRes.rows.map((r) => ({ status: r.status, count: parseInt(r.count, 10) })),
            bySeverity: severityRes.rows.map((r) => ({ severity: r.severity, count: parseInt(r.count, 10) })),
          },
          recentActivity: activityRes.rows,
        },
      });
    } catch (error: any) {
      console.error('[AdminController.getStats]:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve admin stats' });
    }
  },

  /**
   * List all registered users with role and search filters
   */
  async getUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { role, search } = req.query;

      const conditions: string[] = [];
      const params: any[] = [];
      let paramIdx = 1;

      if (role && role !== 'ALL') {
        conditions.push(`role = $${paramIdx++}`);
        params.push((role as string).toUpperCase());
      }

      if (search) {
        conditions.push(`(full_name ILIKE $${paramIdx} OR email ILIKE $${paramIdx})`);
        params.push(`%${search}%`);
        paramIdx++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const usersRes = await query<SafeUser>(
        `SELECT id, full_name, email, phone, role, profile_image, is_active, created_at, updated_at
         FROM users
         ${whereClause}
         ORDER BY created_at DESC`,
        params
      );

      res.status(200).json({
        success: true,
        message: 'Users retrieved',
        data: usersRes.rows,
      });
    } catch (error: any) {
      console.error('[AdminController.getUsers]:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve users' });
    }
  },

  /**
   * Create an authority account (Admin only)
   */
  async createAuthority(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { fullName, email, phone, password } = req.body;

      if (!fullName || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'Full name, email, and password are required',
        });
        return;
      }

      const cleanEmail = email.trim().toLowerCase();

      const existing = await query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
      if (existing.rows.length > 0) {
        res.status(409).json({ success: false, message: 'Email already registered' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const userRes = await query<SafeUser>(
        `INSERT INTO users (full_name, email, phone, password_hash, role)
         VALUES ($1, $2, $3, $4, 'AUTHORITY')
         RETURNING id, full_name, email, phone, role, is_active, created_at, updated_at`,
        [fullName.trim(), cleanEmail, phone ? phone.trim() : null, passwordHash]
      );

      // Activity log
      await query(
        `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata)
         VALUES ($1, 'AUTHORITY_CREATED', 'USER', $2, $3)`,
        [req.user!.id, userRes.rows[0].id, JSON.stringify({ email: cleanEmail })]
      );

      res.status(201).json({
        success: true,
        message: 'Authority account created successfully',
        data: userRes.rows[0],
      });
    } catch (error: any) {
      console.error('[AdminController.createAuthority]:', error);
      res.status(500).json({ success: false, message: 'Failed to create authority' });
    }
  },

  /**
   * Toggle user active/inactive status
   */
  async toggleUserStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (id === req.user?.id) {
        res.status(400).json({ success: false, message: 'Cannot deactivate your own admin account' });
        return;
      }

      const result = await query<SafeUser>(
        `UPDATE users 
         SET is_active = NOT is_active, updated_at = NOW() 
         WHERE id = $1 
         RETURNING id, full_name, email, role, is_active`,
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const user = result.rows[0];

      // Activity log
      await query(
        `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata)
         VALUES ($1, 'USER_STATUS_TOGGLED', 'USER', $2, $3)`,
        [req.user!.id, user.id, JSON.stringify({ is_active: user.is_active })]
      );

      res.status(200).json({
        success: true,
        message: `User account ${user.is_active ? 'activated' : 'deactivated'}`,
        data: user,
      });
    } catch (error: any) {
      console.error('[AdminController.toggleUserStatus]:', error);
      res.status(500).json({ success: false, message: 'Failed to update user status' });
    }
  },
};
