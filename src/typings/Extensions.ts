import { Router, Express, Response, NextFunction } from 'express';
import { Logger } from 'winston';

export interface FunctionFile {
  /** @desc Name of the function */
  name: string;
  /** @desc Function to execute */
  execute: (server: Router, ...args: unknown[]) => Promise<unknown>
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

export interface CustomExpress extends Express {
  /** @desc Logging object */
  stdrr?: Logger;
  /** @desc Extension of the locals object */
  locals: {
    /** @desc Functions for the app */
    functions?: Map<string, FunctionFile>;
  }
}