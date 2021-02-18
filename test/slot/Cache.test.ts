import { existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { createConfig, FileCacheOptions, MemoryCacheOptions, compose, Cache, FileCache, MemoryCache } from '../../src';
import CustomCache, { CustomCacheOptions } from '../fixture/CustomCache';

describe('Cache Slot', () => {
  it('can import file cache', () => {
    const dir = join(tmpdir(), 'cache-' + Date.now());
    const options = createConfig<FileCacheOptions>({
      slot: 'FileCache',
      cacheDir: dir,
    });

    expect(existsSync(dir)).toBeFalsy();

    const cache = new Cache(options);

    expect(existsSync(dir)).toBeTruthy();
    expect(cache.getIntance()).toBeInstanceOf(FileCache);
  });

  it('can import memory cache', () => {
    const options = createConfig<MemoryCacheOptions>({
      slot: 'MemoryCache',
    });

    const cache = new Cache(options);

    expect(cache.getIntance()).toBeInstanceOf(MemoryCache);
  });

  it ('can import cache engin from other module', () => {
    const options = createConfig<CustomCacheOptions>({
      slot: './test/fixture/CustomCache',
      test: true,
    });

    const cache = new Cache(options);

    expect(cache.getIntance()).toBeInstanceOf(CustomCache);
  });

  it ('will throw error when module not found', () => {
    expect(() => new Cache({ slot: '----' })).toThrowError();
    expect(() => new Cache({ slot: '----/---' })).toThrowError();
  });

  it ('can inject ctx.cache to context', async () => {
    const ctx: { cache?: any } = {};
    const cache = new Cache<MemoryCacheOptions>({
      slot: 'MemoryCache',
    });

    await compose([cache])(ctx);
    expect(ctx).toHaveProperty('cache');
    expect(ctx['cache']).toBeInstanceOf(MemoryCache);
  });
});
