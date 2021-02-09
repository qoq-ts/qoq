import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import { BaseCache, BaseCacheOptions } from './BaseCache';
import { createHash } from 'crypto';

export interface FileCacheOptions extends BaseCacheOptions {
  slot: 'FileCache';
  cacheDir: string;
}

interface FileData {
  k: string;
  v: string;
  t: number;
};

export class FileCache extends BaseCache {
  protected readonly dir: string;

  constructor(config: FileCacheOptions) {
    super(config);
    this.dir = path.resolve(config.cacheDir);
    mkdirp.sync(this.dir);
  }

  protected async getValue(key: string): Promise<string | null> {
    const filePath = this.getFilePath(key);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const data: FileData = JSON.parse(fs.readFileSync(filePath).toString());

      if (data && data.k === key && (data.t === -1 || data.t > Date.now())) {
        return data.v;
      }
    } catch {}

    return null;
  }

  protected async setValue(key: string, value: string, ttl?: number): Promise<boolean> {
    const filePath = this.getFilePath(key);
    const serialize: FileData = {
      k: key,
      v: value,
      t: ttl === undefined ? -1 : Date.now() + ttl,
    };

    mkdirp.sync(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(serialize));
    return true;
  }

  protected async deleteValue(key: string): Promise<boolean> {
    const filePath = this.getFilePath(key);

    fs.unlinkSync(filePath);

    return !fs.existsSync(filePath);
  }

  protected async deleteAllValues(): Promise<boolean> {
    return new Promise((resolve) => {
      // rimraf recommend to use async instead of rimraf.sync
      rimraf(this.dir, (err) => {
        resolve(!err);
      });
    });
  }

  protected getFilePath(key: string): string {
    const hashKey = createHash('md5').update(key).digest('hex');
    return path.join(this.dir, hashKey.substr(0, 2), hashKey.substr(2, 2), hashKey);
  }
}
