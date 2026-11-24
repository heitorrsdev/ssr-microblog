import { createDb, type DbHandle } from '../db/database';

export function createTestDb(): DbHandle {
  return createDb(':memory:', 'drizzle');
}
