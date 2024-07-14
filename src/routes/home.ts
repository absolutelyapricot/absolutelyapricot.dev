import { Request, Response } from "express";
import { CustomExpress } from "../typings/Extensions.js";

export const paths = '/';
export const methods = 'get';
export const priority = 0;
export async function execute(req: Request, res: Response) {
  (req.app as CustomExpress).stdrr.log('info', `${req.ip} connected to the site!`);
  res.status(200).send(`Hello ${req.ip}, welcome to Apricot's Development Site!`);
}