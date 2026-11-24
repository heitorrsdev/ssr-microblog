import type { ErrorRequestHandler } from 'express';
import type { Logger } from './logger';

export function createRenderErrorHandler(logger: Logger): ErrorRequestHandler {
  return (error, req, res, next) => {
    logger.error({ err: error, path: req.path }, 'failed to render the page');
    if (res.headersSent) {
      next(error);
      return;
    }
    res.status(500).type('text/plain').send('Erro interno do servidor');
  };
}
