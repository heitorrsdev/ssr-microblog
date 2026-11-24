import { Router } from 'express';
import { NotFoundError } from '../errors';
import type { Logger } from '../logger';
import type { PostsService } from '../services/posts.service';
import type { UsersService } from '../services/users.service';
import { createErrorHandler } from './error-handler';
import { handleParams, idParams, pageQuery } from './schemas';

export interface ApiServices {
  posts: PostsService;
  users: UsersService;
}

export function createApiRouter(services: ApiServices, logger: Logger): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  router.get('/posts', (req, res) => {
    res.json(services.posts.list(pageQuery.parse(req.query)));
  });

  router.get('/posts/:id', (req, res) => {
    const { id } = idParams.parse(req.params);
    res.json(services.posts.get(id));
  });

  router.get('/users/:handle', (req, res) => {
    const { handle } = handleParams.parse(req.params);
    res.json(services.users.getProfile(handle));
  });

  router.get('/users/:handle/posts', (req, res) => {
    const { handle } = handleParams.parse(req.params);
    res.json(services.users.listPosts(handle, pageQuery.parse(req.query)));
  });

  router.use((_req, _res, next) => {
    next(new NotFoundError('route_not_found', 'Route not found'));
  });
  router.use(createErrorHandler(logger));

  return router;
}
