import { initCache } from '../caching/initCache';
import { BaseCache, BaseCacheOptions } from '../caching/BaseCache';
import { Slot } from './Slot';

export interface CacheContextProps {
  cache: BaseCache;
}

export class CacheSlot<T extends BaseCacheOptions> extends Slot<Slot.Mix, CacheContextProps> {
  public readonly cache: BaseCache;

  constructor(config: T | BaseCache) {
    super();
    const instance
      = this.cache
      = config instanceof BaseCache ? config : initCache(config);

    this.use((ctx, next) => {
      ctx.cache = instance;
      return next();
    });
  }
}
