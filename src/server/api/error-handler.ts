import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors';
import type { Logger } from '../logger';

export function createErrorHandler(logger: Logger): ErrorRequestHandler {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Express requires 4 parameters
  return (error, req, res, _next) => {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: { code: error.code, message: error.message } });
      return;
    }
    if (error instanceof ZodError) {
      res.status(400).json({ error: { code: 'invalid_request', message: 'Invalid parameters' } });
      return;
    }
    logger.error({ err: error, path: req.path }, 'unhandled API error');
    res.status(500).json({ error: { code: 'internal_error', message: 'Internal error' } });
  };
}
