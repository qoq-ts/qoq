import { existsSync } from 'fs';
import { basename, dirname, resolve } from 'path';
import { BaseCache, BaseCacheOptions, Slot } from '..';

type ChildCache<T> = new (config: T) => BaseCache;

export interface CacheContextProps {
  cache: BaseCache
}

export class Cache<T extends BaseCacheOptions> extends Slot<Slot.Mix, CacheContextProps> {
  protected readonly instance: BaseCache;

  constructor(config: T) {
    super();
    const RealCache = this.getCache(config.slot);
    const instance = this.instance = new RealCache(config);

    this.use((ctx, next) => {
      ctx.cache = instance;
      return next();
    });
  }

  getIntance() {
    return this.instance;
  }

  protected getCache(slot: string): ChildCache<T> {
    if (!slot.includes('/')) {
      // From built-in
      return this.findRealCache(require(`../caching/${slot}`), slot);
    } else if (
      existsSync(slot) ||
      existsSync(slot + '.js') ||
      existsSync(slot + '.ts')
    ) {
      // From local
      return this.findRealCache(require(resolve(slot)), basename(slot));
    } else {
      // From node_modules
      return this.findRealCache(require(dirname(slot)), basename(slot));
    }
  }

  protected findRealCache(modules: Record<string, any>, name: string): ChildCache<T> {
    const custom: ChildCache<T> = modules[name] || modules.default;

    if (
      custom &&
      custom.prototype &&
      custom.prototype instanceof BaseCache &&
      custom !== BaseCache
    ) {
      return custom;
    }

    throw new Error('Not found cache module');
  };
}
