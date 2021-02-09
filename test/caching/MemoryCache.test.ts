import { expect } from 'chai';
import { createHash } from 'crypto';
import sleep from 'sleep-promise';
import { MemoryCache } from '../../src';

describe('Memory Cache', () => {
  let cache: MemoryCache;

  beforeEach(() => {
    cache = new MemoryCache({
      slot: 'MemoryCache',
    });
  });

  it ('can set anything (string, number, object)', async () => {
    await cache.set('hello', 'world');
    expect(await cache.get('hello')).to.equal('world');

    await cache.set('hello', { name: 'bob' });
    expect(await cache.get('hello')).to.contain({ name: 'bob' });

    await cache.set('test', 1001);
    expect(await cache.get('test')).to.equal(1001);
  });

  it ('can use ttl', async () => {
    await cache.set('hello', 'world', 500);
    expect(await cache.get('hello')).to.equal('world');

    await sleep(300);
    expect(await cache.get('hello')).to.equal('world');

    await sleep(202);
    expect(await cache.get('hello')).to.null;
  });

  it ('can add value only once', async () => {
    expect(await cache.add('hello', 'world')).to.be.true;
    expect(await cache.get('hello')).to.equal('world');

    expect(await cache.add('hello', 'next data')).to.be.false;
    expect(await cache.get('hello')).to.equal('world');
  });

  it ('can add value many times with ttl', async () => {
    expect(await cache.add('hello', 'world', 500)).to.be.true;
    expect(await cache.add('hello', 'next data', 500)).to.be.false;
    expect(await cache.get('hello')).to.equal('world');
    await sleep(502);
    expect(await cache.add('hello', 'next data', 500)).to.be.true;
    expect(await cache.get('hello')).to.equal('next data');
  });

  it ('can delete value', async () => {
    await cache.add('hello', 'world');
    expect(await cache.get('hello')).to.equal('world');

    expect(await cache.delete('hello')).to.be.true;
    expect(await cache.get('hello')).to.be.null;
  });

  it ('can delete all caches', async () => {
    await cache.set('hello', 'world');
    await cache.set('test', 'data');
    expect(await cache.get('hello')).to.equal('world');
    expect(await cache.get('test')).to.equal('data');

    expect(await cache.deleteAll()).to.be.true;
    expect(await cache.get('hello')).to.be.null;
    expect(await cache.get('test')).to.be.null;
  });

  it ('can set key prefix', async () => {
    expect(cache.buildKey('hello')).to.equal('hello');

    cache = new MemoryCache({
      slot: 'MemoryCache',
      keyPrefix: 'cache-',
    });

    expect(cache.buildKey('hello')).to.equal('cache-hello');
  });

  it ('max key length should less than 32', () => {
    const key = 'x'.repeat(33);

    expect(cache.buildKey('x'.repeat(33))).to.equal(createHash('md5').update(key).digest('hex'))
  });

  it ('can set value when value doesn\'t exist', async () => {
    expect(await cache.get('hello')).to.be.null;
    expect(await cache.getOrSet('hello', () => 'world')).to.equal('world');
    expect(await cache.get('hello')).to.equal('world');
    expect(await cache.getOrSet('hello', () => 'test data')).to.equal('world');

    expect(await cache.getOrSet('test1', () => 'test data', 500)).to.equal('test data');
    expect(await cache.getOrSet('test1', () => 'new test data', 500)).to.equal('test data');
    await sleep(502);
    expect(await cache.getOrSet('test1', () => 'new test data', 500)).to.equal('new test data');
  });

  it ('can use default value', async () => {
    expect(await cache.get('hello')).to.be.null;
    expect(await cache.get('hello', 'world')).to.equal('world');

    await cache.set('hello', 'test data');
    expect(await cache.get('hello', 'world')).to.equal('test data');
  });

  it ('can set max size to limit memory usage', async () => {
    cache = new MemoryCache({
      slot: 'MemoryCache',
      max: 3,
    });

    await cache.set('hello', 'world');
    await cache.set('test', 'test data');
    await cache.set('test2', 'test2 data');
    await cache.set('test3', 'test3 data');

    expect(await cache.get('hello')).to.be.null;
    expect(await cache.get('test')).to.equal('test data');
    expect(await cache.get('test2')).to.equal('test2 data');
    expect(await cache.get('test3')).to.equal('test3 data');

    await cache.set('test4', 'test4 data');
    expect(await cache.get('test')).to.be.null;
  });
});
