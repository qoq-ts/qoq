import { join } from 'path';
import { getDirName } from 'this-file';

export const rootdir = join(getDirName(), '..');
