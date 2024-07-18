import { Express, NextFunction, Response, Router } from 'express';
import { Logger } from 'winston';

export interface FunctionFile {
  /** @desc Name of the function */
  name: string;
  /** @desc Function to execute */
  execute: (server: Router, logger: Logger, ...args: unknown[]) => Promise<unknown>
}

export interface RouteFile {
  /** @desc Is this file called by another file and should be ignored? */
  isHandler: boolean;
  /** @desc Paths supported */
  paths: string | string[];
  /** @desc Methods supported */
  methods: string | string[];
  /** @desc Priority of the route */
  priority: number;
  /** @desc Function to execute */
  execute: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
}

/** @desc Extends the locals property on available objects */
export type ExtendLocals = {
  /** @desc Winston {@link Logger} for logging. Use {@link Response#locals} in routes */
  logger?: Logger;
  /** @desc Functions for the app */
  functions?: Map<string, FunctionFile>;
}

/** @deprecated Consider passing the logger as a variable */
export interface CustomExpress extends Express {
  locals: ExtendLocals;
}
export interface CustomResponse extends Response {
  locals: ExtendLocals;
}