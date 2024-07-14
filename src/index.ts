import { default as cookieParser } from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import { default as express } from 'express';
import helmet from 'helmet';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:https';
import * as uuid from 'uuid';
import { execute as loadFunctions } from './functions/loader.js';
import { default as serverConfig } from './configs/server.json' assert { type: 'json' };
import { default as winston } from 'winston';
import { CustomExpress } from './typings/Extensions.js';
import 'winston-daily-rotate-file';

if (process.env.NODE_ENV === 'development') console.warn('Server is running in development mode!');

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
const server: CustomExpress = express();
server.stdrr = logger;
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
//#endregion

// Functions are loaded through the loader.js file
// and ready functions are run when done with loading
server.locals.functions = await loadFunctions(server);
[...server.locals.functions.entries()]
  .filter(([name]) => name.startsWith('ready'))
  .forEach(([, data]) => data.execute(server));

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
