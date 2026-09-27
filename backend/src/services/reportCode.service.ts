import { PoolClient } from 'pg';
import { query } from '../config/db';

/**
 * Generates an atomic, collision-safe report code backed by PostgreSQL sequence
 * Format: ECOVA-100001, ECOVA-100002, etc.
 */
export async function generateReportCode(client?: PoolClient): Promise<string> {
  const sql = `SELECT nextval('report_code_seq') AS seq_num;`;
  
  const result = client 
    ? await client.query<{ seq_num: string }>(sql)
    : await query<{ seq_num: string }>(sql);

  const seq = result.rows[0].seq_num;
  return `ECOVA-${seq}`;
}
