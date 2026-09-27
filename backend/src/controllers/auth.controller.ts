import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, withTransaction } from '../config/db';
import { env } from '../config/env';
import { AuthRequest, SafeUser, User } from '../types';

export const authController = {
  /**
   * Register a new Citizen account
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { fullName, email, password, phone } = req.body;

      if (!fullName || !fullName.trim()) {
        res.status(400).json({ success: false, message: 'Full name is required' });
        return;
      }

      if (!email || !email.includes('@')) {
        res.status(400).json({ success: false, message: 'A valid email address is required' });
        return;
      }

      if (!password || password.length < 8) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long',
        });
        return;
      }

      const cleanEmail = email.trim().toLowerCase();

      // Check if email already exists
      const existing = await query<User>('SELECT id FROM users WHERE email = $1', [cleanEmail]);
      if (existing.rows.length > 0) {
        res.status(409).json({
          success: false,
          message: 'An account with this email address already exists',
        });
        return;
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const result = await withTransaction(async (client) => {
        // Default role is always CITIZEN for public registration
        const insertUserSql = `
          INSERT INTO users (full_name, email, phone, password_hash, role)
          VALUES ($1, $2, $3, $4, 'CITIZEN')
          RETURNING id, full_name, email, phone, role, profile_image, is_active, created_at, updated_at;
        `;
        const userRes = await client.query<SafeUser>(insertUserSql, [
          fullName.trim(),
          cleanEmail,
          phone ? phone.trim() : null,
          passwordHash,
        ]);

        const newUser = userRes.rows[0];

        // Record activity log
        await client.query(
          `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata)
           VALUES ($1, 'USER_REGISTERED', 'USER', $2, $3)`,
          [newUser.id, newUser.id, JSON.stringify({ email: newUser.email, role: newUser.role })]
        );

        return newUser;
      });

      const token = jwt.sign(
        { userId: result.id, role: result.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as any }
      );

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          user: result,
          token,
        },
      });
    } catch (error: any) {
      console.error('[AuthController.register]:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed. Please try again.',
      });
    }
  },

  /**
   * Login with email and password
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
        return;
      }

      const cleanEmail = email.trim().toLowerCase();

      const userRes = await query<User>(
        `SELECT id, full_name, email, phone, password_hash, role, profile_image, is_active, created_at, updated_at
         FROM users 
         WHERE email = $1`,
        [cleanEmail]
      );

      if (userRes.rows.length === 0) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      const user = userRes.rows[0];

      if (!user.is_active) {
        res.status(403).json({
          success: false,
          message: 'This account has been deactivated. Please contact support.',
        });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      // Log login event
      await query(
        `INSERT INTO activity_logs (user_id, action, entity_type, entity_id)
         VALUES ($1, 'USER_LOGIN', 'USER', $2)`,
        [user.id, user.id]
      );

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as any }
      );

      const { password_hash, ...safeUser } = user;

      res.status(200).json({
        success: true,
        message: 'Signed in successfully',
        data: {
          user: safeUser,
          token,
        },
      });
    } catch (error: any) {
      console.error('[AuthController.login]:', error);
      res.status(500).json({
        success: false,
        message: 'Sign in failed. Please try again.',
      });
    }
  },

  /**
   * Get authenticated user profile
   */
  async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      // Count reports submitted and resolved for this user
      const statsRes = await query<{ total_reports: string; resolved_reports: string }>(
        `SELECT 
           COUNT(*) as total_reports,
           COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved_reports
         FROM reports 
         WHERE user_id = $1`,
        [req.user.id]
      );

      const stats = statsRes.rows[0] || { total_reports: '0', resolved_reports: '0' };

      res.status(200).json({
        success: true,
        message: 'User profile retrieved',
        data: {
          ...req.user,
          reportsSubmitted: parseInt(stats.total_reports, 10),
          reportsResolved: parseInt(stats.resolved_reports, 10),
        },
      });
    } catch (error: any) {
      console.error('[AuthController.getMe]:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve profile' });
    }
  },

  /**
   * Update profile information
   */
  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { fullName, phone, profileImage } = req.body;

      const updateSql = `
        UPDATE users
        SET full_name = COALESCE($1, full_name),
            phone = COALESCE($2, phone),
            profile_image = COALESCE($3, profile_image),
            updated_at = NOW()
        WHERE id = $4
        RETURNING id, full_name, email, phone, role, profile_image, is_active, created_at, updated_at;
      `;

      const result = await query<SafeUser>(updateSql, [
        fullName ? fullName.trim() : null,
        phone ? phone.trim() : null,
        profileImage || null,
        req.user.id,
      ]);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: result.rows[0],
      });
    } catch (error: any) {
      console.error('[AuthController.updateProfile]:', error);
      res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
  },
};
