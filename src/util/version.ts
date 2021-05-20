import { readFileSync } from 'fs';
import { join } from 'path';
import { rootdir } from './rootdir';

export const version =
  JSON.parse(readFileSync(join(rootdir, '..', 'package.json')).toString()).version || '0.0.0';
