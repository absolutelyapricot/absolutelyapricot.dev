import { Request } from "express";
import { CustomResponse } from "../typings/Extensions.js";

export const paths = '*';
export const methods = 'get';
export const priority = -1;
export async function execute(req: Request, res: CustomResponse) {
  res.locals.logger.log('info', `404 Not Found for ${req.method} ${req.originalUrl}`);
  res.status(404).send('That page does not exist. You sure you typed the right URL?')
}