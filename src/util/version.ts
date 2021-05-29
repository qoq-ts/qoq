import { createContext } from 'this-file';

export const version = createContext().require('../../package.json').version || '0.0.0';
