import { join } from 'path';
import { createContext } from 'this-file';

const context = createContext();

export const rootdir = join(context.dirname, '..');
