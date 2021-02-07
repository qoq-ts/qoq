import { BaseCache, BaseCacheOptions } from '../caching/BaseCache';
import { Slot } from './Slot';

type ChildCache<T> = new (config: T) => BaseCache;

export class Cache<T extends BaseCacheOptions> extends Slot<Slot.Mix, { cache: BaseCache }> {
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
    const paths = slot.split('/');
    let RealCache: ChildCache<T>;

    try {
      if (paths.length < 1 || paths.length > 2) {
        throw new Error();
      }

      if (paths.length === 1) {
        RealCache = this.findRealCache(require(`../caching/${paths[0]}`), paths[0]!);
      } else {
        RealCache = this.findRealCache(require(paths[0]!), paths[1]!);
      }
    } catch (e) {
      throw new TypeError(`Cache slot ${slot} is invalid`);
    }

    return RealCache;
  }

  protected findRealCache(modules: Record<string, any>, name: string): ChildCache<T> {
    const custom: ChildCache<T> = modules[name] || (modules.default && modules.default[name]);

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
