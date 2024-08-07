import { Express } from 'express';
import { existsSync, readdirSync } from 'node:fs';
import { Logger } from 'winston';
import { FunctionFile } from '../typings/Extensions.js';

export const name = 'load';
// This loads all functions
export async function execute(app: Express, logger: Logger): Promise<Map<string, FunctionFile>> {
  if (!existsSync('./functions')) {
    console.warn('No functions were found! Make sure you are running index.js from the dist directory');
    return new Map() as Map<never, never>;
  }
  // fs.readdirSync can recurse through directories through { recursive: true }
  logger.debug('Loading all functions');
  const functionFiles: string[] = readdirSync(`./functions`, { recursive: true })
    .map((f: unknown) => String(f))
    .map((f: string) => f.replace(`./functions/`, ''))
    .map((f: string) => f.replace(/\\/g, '/'))
    .filter((f: string) => f.endsWith('.js'));

  logger.debug(`Found ${functionFiles.length} function`);

  // Map all the functions and their exports to their name using a map
  // deepcode ignore CollectionUpdatedButNeverQueried: Used in return
  const functions = new Map();
  for (const file of functionFiles) {
    // Set the file
    try {
      const func: FunctionFile = await import(`../functions/${file}`);
      const name = file.replace(/\.js$/, '').replace(/\//g, '_');
      // Skip if it's an archive
      if (name.includes('archive_')) continue;
      functions.set(name, func);
      logger.debug(`✓ ${name}`);
    } catch (err) {
      logger.error({ msg: `✗ ${file}`, err });
    }
  }
  // Return values
  return functions;
}