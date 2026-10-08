import { Response } from 'express';
import { query, withTransaction } from '../config/db';
import { generateReportCode } from '../services/reportCode.service';
import { emitToUser, broadcast } from '../services/socket.service';
import { AuthRequest, Report, ReportStatus, Severity } from '../types';

export const reportController = {
  /**
   * Submit a new civic or environmental issue report
   */
  async createReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { category, description, severity, latitude, longitude, address } = req.body;

      if (!category) {
        res.status(400).json({ success: false, message: 'Category is required' });
        return;
      }

      if (!description || !description.trim()) {
        res.status(400).json({ success: false, message: 'Description is required' });
        return;
      }

      if (!severity || !['LOW', 'MEDIUM', 'HIGH'].includes(severity.toUpperCase())) {
        res.status(400).json({
          success: false,
          message: 'Severity must be one of LOW, MEDIUM, or HIGH',
        });
        return;
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (isNaN(lat) || isNaN(lng)) {
        res.status(400).json({
          success: false,
          message: 'Valid latitude and longitude coordinates are required',
        });
        return;
      }

      // Check category in database (accept name or id)
      let catId: number;
      if (!isNaN(parseInt(category, 10))) {
        catId = parseInt(category, 10);
      } else {
        const catRes = await query<{ id: number; name: string }>(
          'SELECT id, name FROM categories WHERE LOWER(name) = LOWER($1)',
          [category.trim()]
        );
        if (catRes.rows.length === 0) {
          // Default to Other (id 6)
          catId = 6;
        } else {
          catId = catRes.rows[0].id;
        }
      }

      // Find responsible authority based on category
      let assignedAuthorityId: string | null = null;
      const authorityRes = await query<{ id: string; email: string }>(
        `SELECT id, email FROM users WHERE role = 'AUTHORITY' AND is_active = true ORDER BY created_at ASC`
      );

      if (authorityRes.rows.length > 0) {
        // Route Water to water authority if available, otherwise first authority
        if (catId === 2) {
          const waterAuth = authorityRes.rows.find((a) => a.email.includes('water'));
          assignedAuthorityId = waterAuth ? waterAuth.id : authorityRes.rows[0].id;
        } else {
          assignedAuthorityId = authorityRes.rows[0].id;
        }
      }

      // Determine photo URL
      let photoUrl: string | null = null;
      if (req.file) {
        photoUrl = `/uploads/reports/${req.file.filename}`;
      } else if (req.body.photoUrl) {
        photoUrl = req.body.photoUrl;
      }

      const cleanSeverity = severity.toUpperCase() as Severity;

      // Atomic execution using transaction
      const newReport = await withTransaction(async (client) => {
        // 1. Generate code
        const reportCode = await generateReportCode(client);

        // 2. Insert report
        const insertReportSql = `
          INSERT INTO reports (
            report_code, user_id, category_id, description, severity,
            latitude, longitude, address, photo_url, status, authority_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'SUBMITTED', $10)
          RETURNING *;
        `;
        const reportRes = await client.query<Report>(insertReportSql, [
          reportCode,
          req.user!.id,
          catId,
          description.trim(),
          cleanSeverity,
          lat,
          lng,
          address ? address.trim() : `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          photoUrl,
          assignedAuthorityId,
        ]);
        const created = reportRes.rows[0];

        // 3. Insert status history
        await client.query(
          `INSERT INTO report_status_history (report_id, status, note, changed_by)
           VALUES ($1, 'SUBMITTED', $2, $3)`,
          [created.id, 'Report submitted by citizen with photo evidence and location pin.', req.user!.id]
        );

        // 4. Record authority assignment if assigned
        if (assignedAuthorityId) {
          await client.query(
            `INSERT INTO authority_assignments (report_id, authority_id, assigned_by)
             VALUES ($1, $2, $3)`,
            [created.id, assignedAuthorityId, req.user!.id]
          );
        }

        // 5. Create notification for citizen
        const notifRes = await client.query(
          `INSERT INTO notifications (user_id, title, message, type)
           VALUES ($1, $2, $3, 'STATUS_UPDATE')
           RETURNING *;`,
          [
            req.user!.id,
            `Report ${created.report_code} Submitted`,
            `Your report regarding civic concern has been recorded and queued for review.`,
          ]
        );

        // 6. Record activity log
        await client.query(
          `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata)
           VALUES ($1, 'REPORT_CREATED', 'REPORT', $2, $3)`,
          [
            req.user!.id,
            created.report_code,
            JSON.stringify({ category_id: catId, severity: cleanSeverity }),
          ]
        );

        return {
          report: created,
          notification: notifRes.rows[0],
        };
      });

      // Emit real-time notification to citizen via Socket.IO
      emitToUser(req.user.id, 'notification:new', newReport.notification);

      // Broadcast to authorities that a new report has been filed
      broadcast('report:new', {
        reportCode: newReport.report.report_code,
        category: catId,
        severity: cleanSeverity,
      });

      res.status(201).json({
        success: true,
        message: 'Report submitted successfully',
        data: newReport.report,
      });
    } catch (error: any) {
      console.error('[ReportController.createReport]:', error);
      res.status(500).json({ success: false, message: 'Failed to submit report. Please retry.' });
    }
  },

  /**
   * Public tracking endpoint: fetch report and status timeline by report_code
   */
  async getReportByCode(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { reportCode } = req.params;
      const cleanCode = reportCode.trim().toUpperCase();

      const reportRes = await query(
        `SELECT 
           r.id, r.report_code, r.description, r.severity, r.latitude, r.longitude, 
           r.address, r.photo_url, r.status, r.upvotes, r.rating, r.feedback_text,
           r.created_at, r.updated_at, r.resolved_at,
           c.name as category_name, c.icon as category_icon,
           auth.full_name as authority_name
         FROM reports r
         JOIN categories c ON r.category_id = c.id
         LEFT JOIN users auth ON r.authority_id = auth.id
         WHERE UPPER(r.report_code) = $1`,
        [cleanCode]
      );

      if (reportRes.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: `No civic report found matching code ${cleanCode}`,
        });
        return;
      }

      const report = reportRes.rows[0];

      // Fetch status history
      const historyRes = await query(
        `SELECT 
           h.id, h.status, h.note, h.created_at,
           u.full_name as changed_by_name
         FROM report_status_history h
         LEFT JOIN users u ON h.changed_by = u.id
         WHERE h.report_id = $1
         ORDER BY h.created_at ASC`,
        [report.id]
      );

      // Fetch actions taken
      const actionsRes = await query(
        `SELECT 
           a.id, a.action_type, a.note, a.created_at,
           u.full_name as authority_name
         FROM report_actions a
         LEFT JOIN users u ON a.authority_id = u.id
         WHERE a.report_id = $1
         ORDER BY a.created_at DESC`,
        [report.id]
      );

      res.status(200).json({
        success: true,
        message: 'Report details retrieved',
        data: {
          ...report,
          statusHistory: historyRes.rows,
          actions: actionsRes.rows,
        },
      });
    } catch (error: any) {
      console.error('[ReportController.getReportByCode]:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve report' });
    }
  },

  /**
   * Get report by internal ID with details
   */
  async getReportById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const reportId = parseInt(id, 10);
      if (isNaN(reportId)) {
        res.status(400).json({ success: false, message: 'Invalid report ID' });
        return;
      }

      const reportRes = await query(
        `SELECT 
           r.*, c.name as category_name, c.icon as category_icon,
           u.full_name as citizen_name, u.email as citizen_email,
           auth.full_name as authority_name
         FROM reports r
         JOIN categories c ON r.category_id = c.id
         JOIN users u ON r.user_id = u.id
         LEFT JOIN users auth ON r.authority_id = auth.id
         WHERE r.id = $1`,
        [reportId]
      );

      if (reportRes.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Report not found' });
        return;
      }

      const report = reportRes.rows[0];

      // Privacy: if Citizen, must be the owner
      if (req.user?.role === 'CITIZEN' && report.user_id !== req.user.id) {
        res.status(403).json({ success: false, message: 'Access denied' });
        return;
      }

      const historyRes = await query(
        `SELECT 
           h.id, h.status, h.note, h.created_at,
           u.full_name as changed_by_name
         FROM report_status_history h
         LEFT JOIN users u ON h.changed_by = u.id
         WHERE h.report_id = $1
         ORDER BY h.created_at ASC`,
        [reportId]
      );

      const actionsRes = await query(
        `SELECT 
           a.id, a.action_type, a.note, a.created_at,
           u.full_name as authority_name
         FROM report_actions a
         LEFT JOIN users u ON a.authority_id = u.id
         WHERE a.report_id = $1
         ORDER BY a.created_at DESC`,
        [reportId]
      );

      res.status(200).json({
        success: true,
        message: 'Report details retrieved',
        data: {
          ...report,
          statusHistory: historyRes.rows,
          actions: actionsRes.rows,
        },
      });
    } catch (error: any) {
      console.error('[ReportController.getReportById]:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve report' });
    }
  },

  /**
   * Get reports submitted by the logged-in citizen
   */
  async getMyReports(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { status, category, search, page = '1', limit = '20' } = req.query;
      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
      const offset = (pageNum - 1) * limitNum;

      const conditions: string[] = ['r.user_id = $1'];
      const params: any[] = [req.user.id];
      let paramIdx = 2;

      if (status && status !== 'ALL') {
        conditions.push(`r.status = $${paramIdx++}`);
        params.push((status as string).toUpperCase());
      }

      if (category && category !== 'ALL') {
        conditions.push(`c.name = $${paramIdx++}`);
        params.push(category);
      }

      if (search) {
        conditions.push(`(
          r.report_code ILIKE $${paramIdx} OR 
          r.description ILIKE $${paramIdx} OR 
          r.address ILIKE $${paramIdx} OR 
          c.name ILIKE $${paramIdx}
        )`);
        params.push(`%${search}%`);
        paramIdx++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Count query
      const countRes = await query<{ count: string }>(
        `SELECT COUNT(*) FROM reports r JOIN categories c ON r.category_id = c.id ${whereClause}`,
        params
      );
      const total = parseInt(countRes.rows[0].count, 10);

      // Data query
      const dataSql = `
        SELECT 
          r.*, c.name as category_name, c.icon as category_icon,
          auth.full_name as authority_name
        FROM reports r
        JOIN categories c ON r.category_id = c.id
        LEFT JOIN users auth ON r.authority_id = auth.id
        ${whereClause}
        ORDER BY r.created_at DESC
        LIMIT $${paramIdx++} OFFSET $${paramIdx++}
      `;
      params.push(limitNum, offset);

      const dataRes = await query(dataSql, params);

      res.status(200).json({
        success: true,
        message: 'My reports retrieved',
        data: dataRes.rows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error: any) {
      console.error('[ReportController.getMyReports]:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve reports' });
    }
  },

  /**
   * Authority/Admin: List all reports with search, filters, and pagination
   */
  async getAllReports(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status, category, severity, authorityId, search, page = '1', limit = '20' } = req.query;
      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
      const offset = (pageNum - 1) * limitNum;

      const conditions: string[] = [];
      const params: any[] = [];
      let paramIdx = 1;

      // If user is AUTHORITY, show assigned reports (or unassigned in their jurisdiction)
      if (req.user?.role === 'AUTHORITY' && !authorityId) {
        conditions.push(`(r.authority_id = $${paramIdx++} OR r.authority_id IS NULL)`);
        params.push(req.user.id);
      } else if (authorityId) {
        conditions.push(`r.authority_id = $${paramIdx++}`);
        params.push(authorityId);
      }

      if (status && status !== 'ALL') {
        conditions.push(`r.status = $${paramIdx++}`);
        params.push((status as string).toUpperCase());
      }

      if (category && category !== 'ALL') {
        conditions.push(`c.name = $${paramIdx++}`);
        params.push(category);
      }

      if (severity && severity !== 'ALL') {
        conditions.push(`r.severity = $${paramIdx++}`);
        params.push((severity as string).toUpperCase());
      }

      if (search) {
        conditions.push(`(
          r.report_code ILIKE $${paramIdx} OR 
          r.description ILIKE $${paramIdx} OR 
          r.address ILIKE $${paramIdx} OR 
          c.name ILIKE $${paramIdx} OR
          u.full_name ILIKE $${paramIdx}
        )`);
        params.push(`%${search}%`);
        paramIdx++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const countRes = await query<{ count: string }>(
        `SELECT COUNT(*) 
         FROM reports r 
         JOIN categories c ON r.category_id = c.id 
         JOIN users u ON r.user_id = u.id
         ${whereClause}`,
        params
      );
      const total = parseInt(countRes.rows[0].count, 10);

      const dataSql = `
        SELECT 
          r.*, c.name as category_name, c.icon as category_icon,
          u.full_name as citizen_name, u.email as citizen_email,
          auth.full_name as authority_name
        FROM reports r
        JOIN categories c ON r.category_id = c.id
        JOIN users u ON r.user_id = u.id
        LEFT JOIN users auth ON r.authority_id = auth.id
        ${whereClause}
        ORDER BY r.created_at DESC
        LIMIT $${paramIdx++} OFFSET $${paramIdx++}
      `;
      params.push(limitNum, offset);

      const dataRes = await query(dataSql, params);

      res.status(200).json({
        success: true,
        message: 'Reports retrieved',
        data: dataRes.rows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error: any) {
      console.error('[ReportController.getAllReports]:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve reports' });
    }
  },

  /**
   * Authority/Admin: Update report status
   */
  async updateReportStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const reportId = parseInt(id, 10);
      const { status, note } = req.body;

      if (isNaN(reportId)) {
        res.status(400).json({ success: false, message: 'Invalid report ID' });
        return;
      }

      const validStatuses: ReportStatus[] = [
        'SUBMITTED',
        'UNDER_REVIEW',
        'ACTION_TAKEN',
        'RESOLVED',
        'REJECTED',
      ];

      const cleanStatus = (status || '').toUpperCase() as ReportStatus;
      if (!validStatuses.includes(cleanStatus)) {
        res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of [${validStatuses.join(', ')}]`,
        });
        return;
      }

      const reportRes = await query<Report>('SELECT * FROM reports WHERE id = $1', [reportId]);
      if (reportRes.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Report not found' });
        return;
      }
      const currentReport = reportRes.rows[0];

      // Update in transaction
      const updated = await withTransaction(async (client) => {
        const isResolved = cleanStatus === 'RESOLVED';
        const updateSql = `
          UPDATE reports
          SET status = $1,
              updated_at = NOW(),
              resolved_at = CASE WHEN $2::boolean THEN NOW() ELSE resolved_at END,
              authority_id = COALESCE(authority_id, $3)
          WHERE id = $4
          RETURNING *;
        `;
        const updateRes = await client.query<Report>(updateSql, [
          cleanStatus,
          isResolved,
          req.user!.id,
          reportId,
        ]);
        const report = updateRes.rows[0];

        // Add history record
        await client.query(
          `INSERT INTO report_status_history (report_id, status, note, changed_by)
           VALUES ($1, $2, $3, $4)`,
          [reportId, cleanStatus, note || `Status changed to ${cleanStatus}`, req.user!.id]
        );

        // Notify citizen
        const notifMsg = note
          ? `Status updated to ${cleanStatus}: ${note}`
          : `Your report status is now ${cleanStatus}.`;

        const notifRes = await client.query(
          `INSERT INTO notifications (user_id, title, message, type)
           VALUES ($1, $2, $3, $4)
           RETURNING *;`,
          [
            report.user_id,
            `Report ${report.report_code} ${cleanStatus}`,
            notifMsg,
            cleanStatus === 'RESOLVED' ? 'RESOLVED' : 'STATUS_UPDATE',
          ]
        );

        // Activity log
        await client.query(
          `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata)
           VALUES ($1, 'STATUS_CHANGED', 'REPORT', $2, $3)`,
          [
            req.user!.id,
            report.report_code,
            JSON.stringify({ from: currentReport.status, to: cleanStatus, note }),
          ]
        );

        return {
          report,
          notification: notifRes.rows[0],
        };
      });

      // Socket.IO real-time emission
      emitToUser(currentReport.user_id, 'notification:new', updated.notification);
      emitToUser(currentReport.user_id, 'report:status_changed', {
        reportCode: updated.report.report_code,
        status: cleanStatus,
        note,
      });

      res.status(200).json({
        success: true,
        message: `Report status updated to ${cleanStatus}`,
        data: updated.report,
      });
    } catch (error: any) {
      console.error('[ReportController.updateReportStatus]:', error);
      res.status(500).json({ success: false, message: 'Failed to update report status' });
    }
  },

  /**
   * Authority/Admin: Add an action taken on a report
   */
  async addReportAction(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const reportId = parseInt(id, 10);
      const { actionType, note } = req.body;

      if (isNaN(reportId)) {
        res.status(400).json({ success: false, message: 'Invalid report ID' });
        return;
      }

      if (!actionType || !note || !note.trim()) {
        res.status(400).json({
          success: false,
          message: 'actionType and note are required',
        });
        return;
      }

      const reportRes = await query<Report>('SELECT * FROM reports WHERE id = $1', [reportId]);
      if (reportRes.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Report not found' });
        return;
      }
      const currentReport = reportRes.rows[0];

      const result = await withTransaction(async (client) => {
        // Insert action
        const actionRes = await client.query(
          `INSERT INTO report_actions (report_id, authority_id, action_type, note)
           VALUES ($1, $2, $3, $4)
           RETURNING *;`,
          [reportId, req.user!.id, actionType.toUpperCase(), note.trim()]
        );
        const action = actionRes.rows[0];

        // If status was SUBMITTED or UNDER_REVIEW, update to ACTION_TAKEN
        let updatedStatus = currentReport.status;
        if (currentReport.status === 'SUBMITTED' || currentReport.status === 'UNDER_REVIEW') {
          updatedStatus = 'ACTION_TAKEN';
          await client.query(
            `UPDATE reports SET status = 'ACTION_TAKEN', updated_at = NOW() WHERE id = $1`,
            [reportId]
          );
          await client.query(
            `INSERT INTO report_status_history (report_id, status, note, changed_by)
             VALUES ($1, 'ACTION_TAKEN', $2, $3)`,
            [reportId, `Action taken: [${actionType}] ${note}`, req.user!.id]
          );
        }

        // Notify citizen
        const notifRes = await client.query(
          `INSERT INTO notifications (user_id, title, message, type)
           VALUES ($1, $2, $3, 'ACTION')
           RETURNING *;`,
          [
            currentReport.user_id,
            `Action Taken on ${currentReport.report_code}`,
            `Authority has taken action: ${note.trim()}`,
          ]
        );

        // Activity log
        await client.query(
          `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata)
           VALUES ($1, 'ACTION_LOGGED', 'REPORT', $2, $3)`,
          [
            req.user!.id,
            currentReport.report_code,
            JSON.stringify({ actionType: actionType.toUpperCase(), note }),
          ]
        );

        return {
          action,
          status: updatedStatus,
          notification: notifRes.rows[0],
        };
      });

      // Socket.IO emission
      emitToUser(currentReport.user_id, 'notification:new', result.notification);

      res.status(201).json({
        success: true,
        message: 'Action recorded successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('[ReportController.addReportAction]:', error);
      res.status(500).json({ success: false, message: 'Failed to record action' });
    }
  },

  /**
   * Community Upvoting: Toggle upvote on a report
   */
  async toggleUpvote(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      let reportId = parseInt(id, 10);

      if (isNaN(reportId)) {
        const found = await query<{ id: number }>('SELECT id FROM reports WHERE UPPER(report_code) = UPPER($1)', [id]);
        if (found.rows.length === 0) {
          res.status(404).json({ success: false, message: 'Report not found' });
          return;
        }
        reportId = found.rows[0].id;
      }

      const result = await withTransaction(async (client) => {
        const existing = await client.query(
          'SELECT id FROM report_upvotes WHERE report_id = $1 AND user_id = $2',
          [reportId, req.user!.id]
        );

        if (existing.rows.length > 0) {
          await client.query('DELETE FROM report_upvotes WHERE report_id = $1 AND user_id = $2', [
            reportId,
            req.user!.id,
          ]);
          const updateRes = await client.query<{ upvotes: number }>(
            'UPDATE reports SET upvotes = GREATEST(0, upvotes - 1) WHERE id = $1 RETURNING upvotes',
            [reportId]
          );
          return { upvoted: false, upvotes: updateRes.rows[0].upvotes };
        } else {
          await client.query('INSERT INTO report_upvotes (report_id, user_id) VALUES ($1, $2)', [
            reportId,
            req.user!.id,
          ]);
          const updateRes = await client.query<{ upvotes: number }>(
            'UPDATE reports SET upvotes = upvotes + 1 WHERE id = $1 RETURNING upvotes',
            [reportId]
          );
          return { upvoted: true, upvotes: updateRes.rows[0].upvotes };
        }
      });

      broadcast('report:upvoted', { reportId, upvotes: result.upvotes });

      res.status(200).json({
        success: true,
        message: result.upvoted ? 'Report upvoted' : 'Upvote removed',
        data: result,
      });
    } catch (error: any) {
      console.error('[ReportController.toggleUpvote]:', error);
      res.status(500).json({ success: false, message: 'Failed to process upvote' });
    }
  },

  /**
   * Citizen Resolution Feedback: Submit 1-5 star rating and comment on resolved reports
   */
  async submitFeedback(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const { rating, feedback } = req.body;
      const ratingNum = parseInt(rating, 10);

      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5' });
        return;
      }

      let reportId = parseInt(id, 10);
      if (isNaN(reportId)) {
        const found = await query<{ id: number }>('SELECT id FROM reports WHERE UPPER(report_code) = UPPER($1)', [id]);
        if (found.rows.length === 0) {
          res.status(404).json({ success: false, message: 'Report not found' });
          return;
        }
        reportId = found.rows[0].id;
      }

      const updateRes = await query<Report>(
        `UPDATE reports 
         SET rating = $1, feedback_text = $2, updated_at = NOW() 
         WHERE id = $3 AND status = 'RESOLVED'
         RETURNING *;`,
        [ratingNum, feedback ? feedback.trim() : null, reportId]
      );

      if (updateRes.rows.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Feedback can only be submitted on resolved reports',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Feedback submitted successfully. Thank you for making our surroundings better!',
        data: updateRes.rows[0],
      });
    } catch (error: any) {
      console.error('[ReportController.submitFeedback]:', error);
      res.status(500).json({ success: false, message: 'Failed to submit feedback' });
    }
  },
};
