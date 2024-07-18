import { Request } from "express";
import { CustomResponse } from "../typings/Extensions.js";

export const paths = '/';
export const methods = 'get';
export const priority = 0;
export async function execute(req: Request, res: CustomResponse) {
  res.locals.logger.log('info', `${req.ip} connected to the site!`);
  res.status(200).send(`Hello ${req.ip}, welcome to Apricot's Development Site!`);
}