import { existsSync } from 'fs';
import { basename, dirname, resolve } from 'path';
import { BaseCache, BaseCacheOptions } from './BaseCache';

type ChildCache = new (config: BaseCacheOptions) => BaseCache;

export const initCache = <T extends BaseCacheOptions>(config: T) => {
  const RealCache = getCacheModule(config.engine);
  return new RealCache(config);
};

const getCacheModule = (engine: string): ChildCache => {
  if (!engine.includes('/')) {
    // From built-in
    return findRealCacheModule(require(`./${engine}`), engine);
  } else if (
    existsSync(engine) ||
    existsSync(engine + '.js') ||
    existsSync(engine + '.ts')
  ) {
    // From local
    return findRealCacheModule(require(resolve(engine)), basename(engine));
  } else {
    // From node_modules
    return findRealCacheModule(require(dirname(engine)), basename(engine));
  }
}

const findRealCacheModule = (modules: Record<string, any>, name: string): ChildCache => {
  const custom: ChildCache = modules[name] || modules.default;

  if (
    custom &&
    custom.prototype &&
    custom.prototype instanceof BaseCache &&
    custom !== BaseCache
  ) {
    return custom;
  }

  throw new Error('Not found cache module');
}
