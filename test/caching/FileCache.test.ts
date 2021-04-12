import fs from 'fs';
import os from 'os';
import { join } from 'path';
import sleep from 'sleep-promise';
import { createHash } from 'crypto';
import { FileCache } from '../../src';

describe('File Cache', () => {
  let cache: FileCache;
  let tempDir = fs.mkdtempSync(join(os.tmpdir(), 'cache-'));

  beforeEach(() => {
    cache = new FileCache({
      engine: FileCache,
      cacheDir: tempDir,
    });
  });

  afterEach(async () => {
    await cache.deleteAll();
  });

  it ('can set anything (string, number, object)', async () => {
    await cache.set('hello', 'world');
    expect(await cache.get('hello')).toEqual('world');

    await cache.set('hello', { name: 'bob' });
    expect(await cache.get('hello')).toMatchObject({ name: 'bob' });

    await cache.set('test', 1001);
    expect(await cache.get('test')).toEqual(1001);
  });

  it ('can use ttl', async () => {
    await cache.set('hello', 'world', 500);
    expect(await cache.get('hello')).toEqual('world');

    await sleep(300);
    expect(await cache.get('hello')).toEqual('world');

    await sleep(202);
    expect(await cache.get('hello')).toBeNull();
  });

  it ('can use exists', async () => {
    expect(await cache.exists('hello')).toBeFalsy();
    await cache.set('hello', 'world');
    expect(await cache.exists('hello')).toBeTruthy();
  });

  it ('can add value only once', async () => {
    expect(await cache.add('hello', 'world')).toBeTruthy();
    expect(await cache.get('hello')).toEqual('world');

    expect(await cache.add('hello', 'next data')).toBeFalsy();
    expect(await cache.get('hello')).toEqual('world');
  });

  it ('can add value many times with ttl', async () => {
    expect(await cache.add('hello', 'world', 500)).toBeTruthy();
    expect(await cache.add('hello', 'next data', 500)).toBeFalsy();
    expect(await cache.get('hello')).toEqual('world');
    await sleep(502);
    expect(await cache.add('hello', 'next data', 500)).toBeTruthy();
    expect(await cache.get('hello')).toEqual('next data');
  });

  it ('can delete value', async () => {
    await cache.add('hello', 'world');
    expect(await cache.get('hello')).toEqual('world');

    expect(await cache.delete('hello')).toBeTruthy();
    expect(await cache.get('hello')).toBeNull();
  });

  it ('can delete all caches', async () => {
    await cache.set('hello', 'world');
    await cache.set('test', 'data');
    expect(await cache.get('hello')).toEqual('world');
    expect(await cache.get('test')).toEqual('data');

    expect(await cache.deleteAll()).toBeTruthy();
    expect(await cache.get('hello')).toBeNull();
    expect(await cache.get('test')).toBeNull();
  });

  it ('can set key prefix', async () => {
    expect(cache.buildKey('hello')).toEqual('hello');

    cache = new FileCache({
      engine: FileCache,
      cacheDir: tempDir,
      keyPrefix: 'cache-',
    });

    expect(cache.buildKey('hello')).toEqual('cache-hello');
  });

  it ('max key length should less than 32', () => {
    const key = 'x'.repeat(33);

    expect(cache.buildKey('x'.repeat(33))).toEqual(createHash('md5').update(key).digest('hex'))
  });

  it ('can set value when value doesn\'t exist', async () => {
    expect(await cache.get('hello')).toBeNull();
    expect(await cache.getOrSet('hello', () => 'world')).toEqual('world');
    expect(await cache.get('hello')).toEqual('world');
    expect(await cache.getOrSet('hello', () => 'test data')).toEqual('world');

    expect(await cache.getOrSet('test1', () => 'test data', 500)).toEqual('test data');
    expect(await cache.getOrSet('test1', () => 'new test data', 500)).toEqual('test data');
    await sleep(502);
    expect(await cache.getOrSet('test1', () => 'new test data', 500)).toEqual('new test data');
  });

  it ('can use default value', async () => {
    expect(await cache.get('hello')).toBeNull();
    expect(await cache.get('hello', 'world')).toEqual('world');

    await cache.set('hello', 'test data');
    expect(await cache.get('hello', 'world')).toEqual('test data');
  });
});
