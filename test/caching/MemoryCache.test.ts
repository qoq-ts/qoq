import { createHash } from 'crypto';
import sleep from 'sleep-promise';
import { MemoryCache } from '../../src';

describe('Memory Cache', () => {
  let cache: MemoryCache;

  beforeEach(() => {
    cache = new MemoryCache({
      engine: MemoryCache,
    });
  });

  it('can set anything (string, number, object)', async () => {
    await cache.set('hello', 'world');
    expect(await cache.get('hello')).toEqual('world');

    await cache.set('hello', { name: 'bob' });
    expect(await cache.get('hello')).toMatchObject({ name: 'bob' });

    await cache.set('test', 1001);
    expect(await cache.get('test')).toEqual(1001);
  });

  it('can use ttl', async () => {
    await cache.set('hello', 'world', 500);
    expect(await cache.get('hello')).toEqual('world');

    await sleep(300);
    expect(await cache.get('hello')).toEqual('world');

    await sleep(202);
    expect(await cache.get('hello')).toBeNull();
  });

  it('can use exists', async () => {
    expect(await cache.exists('hello')).toBeFalsy();
    await cache.set('hello', 'world');
    expect(await cache.exists('hello')).toBeTruthy();
  });

  it('can add value only once', async () => {
    expect(await cache.add('hello', 'world')).toBeTruthy();
    expect(await cache.get('hello')).toEqual('world');

    expect(await cache.add('hello', 'next data')).toBeFalsy();
    expect(await cache.get('hello')).toEqual('world');
  });

  it('can add value many times with ttl', async () => {
    expect(await cache.add('hello', 'world', 500)).toBeTruthy();
    expect(await cache.add('hello', 'next data', 500)).toBeFalsy();
    expect(await cache.get('hello')).toEqual('world');
    await sleep(502);
    expect(await cache.add('hello', 'next data', 500)).toBeTruthy();
    expect(await cache.get('hello')).toEqual('next data');
  });

  it('can delete value', async () => {
    await cache.add('hello', 'world');
    expect(await cache.get('hello')).toEqual('world');

    expect(await cache.delete('hello')).toBeTruthy();
    expect(await cache.get('hello')).toBeNull();
  });

  it('can delete all caches', async () => {
    await cache.set('hello', 'world');
    await cache.set('test', 'data');
    expect(await cache.get('hello')).toEqual('world');
    expect(await cache.get('test')).toEqual('data');

    expect(await cache.deleteAll()).toBeTruthy();
    expect(await cache.get('hello')).toBeNull();
    expect(await cache.get('test')).toBeNull();
  });

  it('can set key prefix', async () => {
    expect(cache.buildKey('hello')).toEqual('hello');

    cache = new MemoryCache({
      engine: MemoryCache,
      keyPrefix: 'cache-',
    });

    expect(cache.buildKey('hello')).toEqual('cache-hello');
  });

  it('max key length should less than 32', () => {
    const key = 'x'.repeat(33);

    expect(cache.buildKey('x'.repeat(33))).toEqual(createHash('md5').update(key).digest('hex'));
  });

  it("can set value when value doesn't exist", async () => {
    expect(await cache.get('hello')).toBeNull();
    expect(await cache.getOrSet('hello', () => 'world')).toEqual('world');
    expect(await cache.get('hello')).toEqual('world');
    expect(await cache.getOrSet('hello', () => 'test data')).toEqual('world');

    expect(await cache.getOrSet('test1', () => 'test data', 500)).toEqual('test data');
    expect(await cache.getOrSet('test1', () => 'new test data', 500)).toEqual('test data');
    await sleep(502);
    expect(await cache.getOrSet('test1', () => 'new test data', 500)).toEqual('new test data');
  });

  it("can set async value when value doesn't exist", async () => {
    expect(await cache.get('hello')).toBeNull();
    expect(
      await cache.getOrSet('hello', async () => {
        await sleep(100);
        return 'world';
      }),
    ).toEqual('world');
    expect(await cache.get('hello')).toEqual('world');
  });

  it('can use default value', async () => {
    expect(await cache.get('hello')).toBeNull();
    expect(await cache.get('hello', 'world')).toEqual('world');

    await cache.set('hello', 'test data');
    expect(await cache.get('hello', 'world')).toEqual('test data');
  });

  it('can set max size to limit memory usage', async () => {
    cache = new MemoryCache({
      engine: MemoryCache,
      max: 3,
    });

    await cache.set('hello', 'world');
    await cache.set('test', 'test data');
    await cache.set('test2', 'test2 data');
    await cache.set('test3', 'test3 data');

    expect(await cache.get('hello')).toBeNull();
    expect(await cache.get('test')).toEqual('test data');
    expect(await cache.get('test2')).toEqual('test2 data');
    expect(await cache.get('test3')).toEqual('test3 data');

    await cache.set('test4', 'test4 data');
    expect(await cache.get('test')).toBeNull();
  });
});
