import { Response } from 'express';
import { query } from '../config/db';
import { AuthRequest } from '../types';

export const dashboardController = {
  /**
   * Get metrics and recent reports for Citizen Dashboard
   */
  async getCitizenDashboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      // Aggregate counts for this citizen
      const statsRes = await query<{
        total_reports: string;
        submitted: string;
        under_review: string;
        action_taken: string;
        resolved: string;
      }>(
        `SELECT 
           COUNT(*) as total_reports,
           COUNT(*) FILTER (WHERE status = 'SUBMITTED') as submitted,
           COUNT(*) FILTER (WHERE status = 'UNDER_REVIEW') as under_review,
           COUNT(*) FILTER (WHERE status = 'ACTION_TAKEN') as action_taken,
           COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved
         FROM reports 
         WHERE user_id = $1`,
        [req.user.id]
      );

      const stats = statsRes.rows[0] || {
        total_reports: '0',
        submitted: '0',
        under_review: '0',
        action_taken: '0',
        resolved: '0',
      };

      // Recent 5 reports
      const recentRes = await query(
        `SELECT 
           r.id, r.report_code, r.description, r.severity, r.status, r.created_at,
           c.name as category_name, c.icon as category_icon
         FROM reports r
         JOIN categories c ON r.category_id = c.id
         WHERE r.user_id = $1
         ORDER BY r.created_at DESC
         LIMIT 5`,
        [req.user.id]
      );

      res.status(200).json({
        success: true,
        message: 'Citizen dashboard metrics retrieved',
        data: {
          metrics: {
            totalReports: parseInt(stats.total_reports, 10),
            submitted: parseInt(stats.submitted, 10),
            underReview: parseInt(stats.under_review, 10),
            actionTaken: parseInt(stats.action_taken, 10),
            resolved: parseInt(stats.resolved, 10),
          },
          recentReports: recentRes.rows,
        },
      });
    } catch (error: any) {
      console.error('[DashboardController.getCitizenDashboard]:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve dashboard data' });
    }
  },
};
