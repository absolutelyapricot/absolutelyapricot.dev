import { NextFunction, Request } from 'express';
import { existsSync, readdirSync } from 'node:fs';
import { CustomResponse } from '../typings/Extensions.js';

const files = [];
if (existsSync('../assets')) {
  const assets = readdirSync('../assets/html', { recursive: true })
    .filter((f) => typeof f === 'string')
    .filter((f) => f.endsWith('.html'))
    .map((f) => '/'+f.replace('.html', ''));
  files.push(...assets);
}

export const paths = files;
export const methods = 'get';
export const priority = 0;
export async function execute(req: Request, res: CustomResponse, next: NextFunction) {
  // TODO: This needs some better security to prevent directory traversal
  if (files.includes(req.path)) {
    res.status(200).sendFile(`${req.path}.html`, { root: '../assets/html' });
  } else {
    res.set('X-Skipped', 'true');
    next('route');
    return;
  }
}
