import { existsSync, readdirSync } from 'node:fs';
import { CustomExpress, RouteFile } from '../../typings/Extensions.js';
const methods = new Map();

/** @desc Loads the route properly */
async function loadRoute(server: CustomExpress, route: RouteFile): Promise<void> {
  // Register the route with Express and the methods map
  for (const method of route.methods) {
    server[method](route.paths, route.execute);
  }
  for(const path of route.paths) {
    methods.set(path, route.methods);
  }
}

export const name = 'routes';
export async function execute(server: CustomExpress): Promise<void> {
  if (!existsSync('./routes')) {
    server.stdrr.warn('Failed to find files in ./routes');
    return;
  }

  server.stdrr.debug('Loading all routes');
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

  // We pass all failed promises to an error handler
  routeHandlers
    .filter((f) => f.status !== 'fulfilled')
    .forEach((f) => server.stdrr.error(`Failed to load route handler`, { err: f }));

  server.stdrr.debug(`Found ${routes.length} routes`);
  for (const route of routes) {
    try {
      // Skip archives
      if (route.startsWith('archive_')) continue;
      const func: RouteFile = await import(`../../routes/${route}`);
      if (func.isHandler) continue;
      loadRoute(server, func);
    } catch (err) {
      server.stdrr.error(`Failed to load ${route}`, { err });
    }
  }
}
