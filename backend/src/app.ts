import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import apiRoutes from './routes';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';

const app: Application = express();

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows frontend to display uploaded photos
  })
);

// CORS configuration
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Request parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
const uploadsDirectory = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDirectory));

// API routes
app.use('/api', apiRoutes);

// Catch 404 and forwarding to error handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
