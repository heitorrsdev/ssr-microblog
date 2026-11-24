import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { createApp } from './server/app';
import { loadConfig } from './server/config';
import { createDb } from './server/db/database';
import { createLogger } from './server/logger';
import { createRenderErrorHandler } from './server/render-error-handler';

const browserDistFolder = join(import.meta.dirname, '../browser');

const config = loadConfig();
const logger = createLogger(config.LOG_LEVEL);
const { db } = createDb(config.DATABASE_PATH, config.MIGRATIONS_DIR);

const app = createApp({ config, db, logger });
const angularApp = new AngularNodeAppEngine();

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.use((req, res, next) => {
  angularApp
    .handle(req, { siteUrl: config.SITE_URL })
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

app.use(createRenderErrorHandler(logger));

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  app.listen(config.PORT, (error) => {
    if (error) {
      throw error;
    }
    logger.info(`Server listening on http://localhost:${config.PORT}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
