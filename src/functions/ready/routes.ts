import { Express } from 'express';
import { existsSync, readdirSync } from 'node:fs';
import { Logger } from 'winston';
import { RouteFile } from '../../typings/Extensions.js';
const methods = new Map();

/** @desc Loads the route properly */
async function loadRoute(server: Express, route: RouteFile): Promise<void> {
  // Register the routes. Flatten the array or create one if needed
  for (const method of [route.methods].flat()) {
    server[method.toLowerCase()](route.paths, route.execute);
  }
  for(const path of [route.paths].flat()) {
    methods.set(path, route.methods);
  }
}

export const name = 'routes';
export async function execute(server: Express, logger: Logger): Promise<void> {
  if (!existsSync('./routes')) {
    logger.warn('Failed to find files in ./routes');
    return;
  }

  logger.debug('Loading all routes');
  const routes = readdirSync('./routes', { recursive: true })
    .map((f: unknown) => String(f))
    .map((f: string) => f.replace('./routes/', ''))
    .map((f: string) => f.replace(/\\/g, '/'))
    .filter((f: string) => f.endsWith('.js'));

  // We can import all the routes and catch errors using Promise.allSettled()
  const promises = routes
    .filter((f: string) => !f.startsWith('archive_'))
    .map((f) => import(`../../routes/${f}`));
  const routeHandlers = await Promise.allSettled(promises);

  // allSettled provides a list of promises and their statuses
  routeHandlers
    .filter((f) => f.status !== 'fulfilled')
    .forEach((f) => logger.error(`Failed to load route handler`, { err: f }));

  const remainingRoutes: RouteFile[] = routeHandlers
    .filter((f) => f.status === 'fulfilled')
    .sort((a, b) => a.value.priority + b.value.priority)
    .map((v) => v.value);

  // loadRoute can register the commands when passed a RouteFile
  logger.debug(`Found ${remainingRoutes.length} routes`);
  for (const route of remainingRoutes) {
    try {
      if (route.isHandler) continue;
      loadRoute(server, route);
    } catch (err) {
      logger.error(`Failed to load ${route}`, { err });
    }
  }

  for (const [path, method] of methods.entries()) {
    server.options(path, (_req, res) => {
      res.setHeader('Access-Control-Allow-Methods', method.join(', '));
      res.status(204).send();
    })
  }
}
