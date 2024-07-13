import { default as cookieParser } from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import { default as express } from 'express';
import helmet from 'helmet';
import { createServer } from 'node:https';
import * as uuid from 'uuid';
import { default as serverConfig } from './configs/server.json' assert { type: 'json' };

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

createServer(
  {
    key: serverConfig.https.key,
    cert: serverConfig.https.cert
  },
  server
).listen(443, () => {
  console.log(`Server listening on port 443`);
});
