import { getRequire } from 'this-file';

export const version = getRequire()('../../package.json').version || '0.0.0';
