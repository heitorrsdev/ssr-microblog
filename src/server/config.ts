import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_PATH: z.string().min(1).default('data/microblog.db'),
  MIGRATIONS_DIR: z.string().min(1).default('drizzle'),
  SITE_URL: z
    .url()
    .default('http://localhost:4000')
    .transform((value) => value.replace(/\/$/, '')),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

export type Config = z.infer<typeof schema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return schema.parse(env);
}
