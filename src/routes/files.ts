import { Request } from 'express';
import { CustomResponse } from '../typings/Extensions.js';
import { existsSync } from 'node:fs';

// TODO: Fix this not being recognised as a route
export const paths = 'files/*';
export const methods = 'get';
export const priority = 0;
export async function execute(req: Request, res: CustomResponse) {
  const cleanedPath = req.path
    .replaceAll('/files/', '')
    .replaceAll('..', '')
    .replaceAll('%20', ' ')
    .replaceAll('%2E', '');
  if(!existsSync(`../assets/${cleanedPath}`)) {
    res.status(404).send({ success: false, data: 'File not found' });
    return;
  }
  res.status(200).sendFile(cleanedPath, { root: '../assets' });
}
