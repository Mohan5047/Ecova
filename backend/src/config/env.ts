import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ecova_db',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
  DB_NAME: process.env.DB_NAME || 'ecova_db',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
  JWT_SECRET: process.env.JWT_SECRET || 'ecova_dev_secret_jwt_key_9ab83bed_f6b4_4a26_production_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB default
};
