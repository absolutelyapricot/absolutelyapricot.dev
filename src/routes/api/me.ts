import { Request } from 'express';
import { CustomResponse } from '../../typings/Extensions.js';

export const paths = 'api/*';
export const methods = 'get';
export const priority = 0;
export async function execute(req: Request, res: CustomResponse) {
  res.status(200).send({ success: true, data: null });
}
