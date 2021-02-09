import { expect } from 'chai';
import fs from 'fs';
import os from 'os';
import { join } from 'path';
import sleep from 'sleep-promise';
import { createHash } from 'crypto';
import { FileCache } from '../../src';

describe('File Cache', () => {
  let cache: FileCache;
  let tempDir = fs.mkdtempSync(join(os.tmpdir(), 'cache-XXXXXX'));

  beforeEach(() => {
    cache = new FileCache({
      slot: 'FileCache',
      cacheDir: tempDir,
    });
  });

  afterEach(async () => {
    await cache.deleteAll();
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

    cache = new FileCache({
      slot: 'FileCache',
      cacheDir: tempDir,
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
});
