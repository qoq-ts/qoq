import LRUCache from 'lru-cache';
import { BaseCache, BaseCacheOptions } from './BaseCache';

export interface MemoryCacheOptions extends BaseCacheOptions {
  slot: 'MemoryCache';
  // The maximum size of the cache, default to `Infinity`
  max?: number;
}

export class MemoryCache extends BaseCache {
  private readonly cache: LRUCache<string, string>;

  constructor(options: MemoryCacheOptions) {
    super(options);
    this.cache = new LRUCache<string, string>({
      max: options.max,
    });
  }

  public async exists(key: string): Promise<boolean> {
    return this.cache.has(this.buildKey(key));
  }

  protected async getValue(key: string): Promise<string | null> {
    const data = this.cache.get(key);
    return data === undefined ? null : data;
  }

  protected async setValue(key: string, value: string, ttl?: number): Promise<boolean> {
    return this.cache.set(key, value, ttl);
  }

  protected async deleteValue(key: string): Promise<boolean> {
    this.cache.del(key);
    return true;
  }

  protected async deleteAllValues(): Promise<boolean> {
    this.cache.reset();
    return true;
  }
}
