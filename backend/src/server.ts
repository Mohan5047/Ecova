import http from 'http';
import app from './app';
import { env } from './config/env';
import { pool } from './config/db';
import { initSocketServer } from './services/socket.service';

const server = http.createServer(app);

// Initialize real-time Socket.IO server
initSocketServer(server);

async function startServer(): Promise<void> {
  try {
    // Verify database connection
    const dbTest = await pool.query('SELECT NOW() as current_time, current_database() as db_name;');
    console.log(
      `[PostgreSQL] Connected successfully to database: ${dbTest.rows[0].db_name} (Server time: ${dbTest.rows[0].current_time})`
    );

    // Start HTTP and WebSocket listener
    server.listen(env.PORT, () => {
      console.log('====================================================');
      console.log(`🌿 ECOVA API Server is running on port ${env.PORT}`);
      console.log(`🌐 Base URL: http://localhost:${env.PORT}/api`);
      console.log(`⚡ Socket.IO listening on port ${env.PORT}`);
      console.log(`🛡️  Environment: ${env.NODE_ENV}`);
      console.log('====================================================');
    });
  } catch (error) {
    console.error('❌ Failed to connect to database or start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown handling
const shutdown = async () => {
  console.log('\n[ECOVA API] Shutting down gracefully...');
  server.close(async () => {
    await pool.end();
    console.log('[ECOVA API] Database pool and HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startServer();
