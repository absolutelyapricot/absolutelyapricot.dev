import { default as cookieParser } from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import { default as express } from 'express';
import helmet from 'helmet';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:https';
import * as uuid from 'uuid';
import { default as winston } from 'winston';
import 'winston-daily-rotate-file';
import { default as serverConfig } from './configs/server.json' assert { type: 'json' };
import { execute as loadFunctions } from './functions/loader.js';
import { ExtendLocals } from './typings/Extensions.js';

if (process.env.NODE_ENV === 'development') console.warn('Server is running in development mode!');
const locals: ExtendLocals = {};

//#region Middleware
const rotateOptions = {
  datePattern: 'DD-MM-YYYY',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
};
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.DailyRotateFile({
      ...rotateOptions,
      filename: '../logs/website-err-%DATE%.log',
      level: 'info'
    }),
    new winston.transports.DailyRotateFile({
      ...rotateOptions,
      filename: '../logs/website-std-%DATE%.log',
      level: 'error'
    })
  ]
});
locals.logger = logger;

const { doubleCsrfProtection } = doubleCsrf({
  cookieName: 'x-csrf-token',
  cookieOptions: {
    sameSite: 'strict',
    path: '/',
    secure: true
  },
  getSecret: () => uuid.v4(),
  getTokenFromRequest: (req) => req.headers['x-csrf-token']
});
//#endregion

//#region Setup
// deepcode ignore UseCsurfForExpress: Implemented through csrf-csrf
const server = express();
server.disable('x-powered-by');
server.use(cookieParser());
server.use(doubleCsrfProtection);
server.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"]
      }
    }
  })
);
// Inject variables
server.use((_req, res, next) => {
  res.locals = locals
  next();
});

// Functions are loaded through the loader.js file
// and ready functions are run when done with loading
locals.functions = await loadFunctions(server, logger);
[...locals.functions.entries()]
.filter(([name]) => name.startsWith('ready'))
.forEach(([, data]) => data.execute(server, logger));
//#endregion

const PORT = process.env.NODE_ENV === 'development' ? 3000 : 443;
createServer(
  {
    key: readFileSync(serverConfig.https.key),
    cert: readFileSync(serverConfig.https.cert)
  },
  server
).listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
