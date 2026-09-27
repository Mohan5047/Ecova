import { Response } from 'express';
import { query } from '../config/db';
import { AuthRequest, Notification } from '../types';

export const notificationController = {
  /**
   * Get all notifications for the authenticated user
   */
  async getNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const notifsRes = await query<Notification>(
        `SELECT * FROM notifications 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 50`,
        [req.user.id]
      );

      res.status(200).json({
        success: true,
        message: 'Notifications retrieved',
        data: notifsRes.rows,
      });
    } catch (error: any) {
      console.error('[NotificationController.getNotifications]:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve notifications' });
    }
  },

  /**
   * Mark a specific notification as read
   */
  async markRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const notifId = parseInt(id, 10);

      await query(
        `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
        [notifId, req.user.id]
      );

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error: any) {
      console.error('[NotificationController.markRead]:', error);
      res.status(500).json({ success: false, message: 'Failed to update notification' });
    }
  },

  /**
   * Mark all notifications as read for current user
   */
  async markAllRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      await query(`UPDATE notifications SET is_read = true WHERE user_id = $1`, [
        req.user.id,
      ]);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error: any) {
      console.error('[NotificationController.markAllRead]:', error);
      res.status(500).json({ success: false, message: 'Failed to update notifications' });
    }
  },
};
