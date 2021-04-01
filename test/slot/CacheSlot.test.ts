import { existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { defineConfig, FileCacheOptions, MemoryCacheOptions, CacheSlot, FileCache, MemoryCache, testMiddleware } from '../../src';
import CustomCache, { CustomCacheOptions } from '../fixture/CustomCache';

describe('Cache Slot', () => {
  it('can import file cache', () => {
    const dir = join(tmpdir(), 'cache-' + Date.now());
    const options = defineConfig<FileCacheOptions>({
      engine: 'FileCache',
      cacheDir: dir,
    });

    expect(existsSync(dir)).toBeFalsy();

    const slot = new CacheSlot(options);

    expect(existsSync(dir)).toBeTruthy();
    expect(slot.cache).toBeInstanceOf(FileCache);
  });

  it('can import memory cache', () => {
    const options = defineConfig<MemoryCacheOptions>({
      engine: 'MemoryCache',
    });

    const slot = new CacheSlot(options);

    expect(slot.cache).toBeInstanceOf(MemoryCache);
  });

  it ('can import cache engin from other module', () => {
    const options = defineConfig<CustomCacheOptions>({
      engine: './test/fixture/CustomCache',
      test: true,
    });

    const slot = new CacheSlot(options);

    expect(slot.cache).toBeInstanceOf(CustomCache);
  });

  it ('will throw error when module not found', () => {
    expect(() => new CacheSlot({ engine: '----' })).toThrowError();
    expect(() => new CacheSlot({ engine: '----/---' })).toThrowError();
  });

  it ('can inject ctx.cache to context', async () => {
    const cache = new CacheSlot<MemoryCacheOptions>({
      engine: 'MemoryCache',
    });

    const ctx = await testMiddleware(cache)({});
    expect(ctx).toHaveProperty('cache');
    expect(ctx.cache).toBeInstanceOf(MemoryCache);
  });
});
