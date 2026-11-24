import { loadConfig } from '../config';
import { createDb } from './database';
import { seed } from './seed';

const config = loadConfig();
const { db, close } = createDb(config.DATABASE_PATH, config.MIGRATIONS_DIR);

console.log(seed(db) ? 'Seed applied.' : 'Database already has data; nothing to do.');
close();
