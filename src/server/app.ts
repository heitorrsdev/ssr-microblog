import express, { type Express } from 'express';
import { createApiRouter } from './api/router';
import type { Config } from './config';
import type { Db } from './db/database';
import { createPostsRepository } from './db/posts.repository';
import { createUsersRepository } from './db/users.repository';
import type { Logger } from './logger';
import { createSeoRouter } from './seo/seo.router';
import { createPostsService } from './services/posts.service';
import { createUsersService } from './services/users.service';

export interface AppDeps {
  config: Config;
  db: Db;
  logger: Logger;
}

export function createApp({ config, db, logger }: AppDeps): Express {
  const posts = createPostsRepository(db);
  const users = createUsersRepository(db);

  const app = express();
  app.disable('x-powered-by');
  app.use(
    '/api',
    createApiRouter(
      { posts: createPostsService({ posts }), users: createUsersService({ users, posts }) },
      logger,
    ),
  );
  app.use(createSeoRouter({ siteUrl: config.SITE_URL, posts, users }));
  return app;
}
