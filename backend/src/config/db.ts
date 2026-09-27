import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { env } from './env';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[PostgreSQL] Unexpected error on idle client:', err);
});

/**
 * Execute a single SQL query using a pooled connection
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (env.NODE_ENV === 'development') {
    // Keep logs concise
    // console.log(`[SQL Query] (${duration}ms) ${text.substring(0, 80).trim()}...`);
  }
  return res;
}

/**
 * Obtain a dedicated client for multi-query operations or transactions
 */
export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

/**
 * Execute a multi-statement transaction safely with automatic rollback on error
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
