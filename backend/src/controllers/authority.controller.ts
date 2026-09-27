import { Response } from 'express';
import { query } from '../config/db';
import { AuthRequest } from '../types';

export const authorityController = {
  /**
   * Authority dashboard: metrics and assigned reports
   */
  async getAuthorityReports(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { status, severity, category, search } = req.query;

      // Calculate authority metrics
      const statsRes = await query<{
        total_assigned: string;
        submitted: string;
        under_review: string;
        action_taken: string;
        resolved: string;
        high_severity: string;
      }>(
        `SELECT 
           COUNT(*) as total_assigned,
           COUNT(*) FILTER (WHERE status = 'SUBMITTED') as submitted,
           COUNT(*) FILTER (WHERE status = 'UNDER_REVIEW') as under_review,
           COUNT(*) FILTER (WHERE status = 'ACTION_TAKEN') as action_taken,
           COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved,
           COUNT(*) FILTER (WHERE severity = 'HIGH' AND status != 'RESOLVED') as high_severity
         FROM reports
         WHERE authority_id = $1 OR authority_id IS NULL`,
        [req.user.id]
      );

      const stats = statsRes.rows[0] || {
        total_assigned: '0',
        submitted: '0',
        under_review: '0',
        action_taken: '0',
        resolved: '0',
        high_severity: '0',
      };

      // Filter assigned reports
      const conditions: string[] = ['(r.authority_id = $1 OR r.authority_id IS NULL)'];
      const params: any[] = [req.user.id];
      let paramIdx = 2;

      if (status && status !== 'ALL') {
        conditions.push(`r.status = $${paramIdx++}`);
        params.push((status as string).toUpperCase());
      }

      if (severity && severity !== 'ALL') {
        conditions.push(`r.severity = $${paramIdx++}`);
        params.push((severity as string).toUpperCase());
      }

      if (category && category !== 'ALL') {
        conditions.push(`c.name = $${paramIdx++}`);
        params.push(category);
      }

      if (search) {
        conditions.push(`(
          r.report_code ILIKE $${paramIdx} OR 
          r.description ILIKE $${paramIdx} OR 
          r.address ILIKE $${paramIdx}
        )`);
        params.push(`%${search}%`);
        paramIdx++;
      }

      const whereClause = `WHERE ${conditions.join(' AND ')}`;

      const reportsRes = await query(
        `SELECT 
           r.*, c.name as category_name, c.icon as category_icon,
           u.full_name as citizen_name, u.phone as citizen_phone
         FROM reports r
         JOIN categories c ON r.category_id = c.id
         JOIN users u ON r.user_id = u.id
         ${whereClause}
         ORDER BY 
           CASE r.severity WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END,
           r.created_at DESC`,
        params
      );

      res.status(200).json({
        success: true,
        message: 'Authority reports retrieved',
        data: {
          metrics: {
            totalAssigned: parseInt(stats.total_assigned, 10),
            submitted: parseInt(stats.submitted, 10),
            underReview: parseInt(stats.under_review, 10),
            actionTaken: parseInt(stats.action_taken, 10),
            resolved: parseInt(stats.resolved, 10),
            highSeverity: parseInt(stats.high_severity, 10),
          },
          reports: reportsRes.rows,
        },
      });
    } catch (error: any) {
      console.error('[AuthorityController.getAuthorityReports]:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve authority reports' });
    }
  },
};
