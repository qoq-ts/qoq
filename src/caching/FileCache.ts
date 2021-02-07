import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import { BaseCache, BaseCacheOptions } from './BaseCache';
import { createHash } from 'crypto';

export interface FileCacheOptions extends BaseCacheOptions {
  slot: 'FileCache';
  dir: string;
  db?: number;
}

interface FileData {
  k: string;
  v: string;
  ttl: number;
};

export class FileCache extends BaseCache {
  protected readonly dir: string;

  constructor(config: FileCacheOptions) {
    super(config);
    this.dir = path.resolve(config.dir);
    mkdirp.sync(this.dir);
  }

  protected async getValue(key: string): Promise<any> {
    const filePath = this.getFilePath(key);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const data: FileData = JSON.parse(fs.readFileSync(filePath).toString());

      if (data && data.k === key && (data.ttl === 0 || data.ttl > Date.now())) {
        return data.v;
      }
    } catch {}

    return null;
  }

  protected async setValue(key: string, value: string, duration: number): Promise<boolean> {
    const filePath = this.getFilePath(key);
    const serialize: FileData = {
      k: key,
      v: value,
      ttl: duration === 0 ? 0 : Date.now() + duration,
    };

    mkdirp.sync(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(serialize));
    return true;
  }

  protected async addValue(key: string, value: string, duration: number): Promise<boolean> {
    const exist = await this.getValue(key);

    if (exist === null) {
      return this.setValue(key, value, duration);
    }

    return false;
  }

  protected async deleteValue(key: string): Promise<boolean> {
    const filePath = this.getFilePath(key);

    fs.unlinkSync(filePath);

    return !fs.existsSync(filePath);
  }

  protected async deleteAllValues(): Promise<boolean> {
    if (fs.existsSync(this.dir)) {
      this.deleteDirs(this.dir);
      fs.rmdirSync(this.dir);
    }

    return true;
  }

  protected deleteDirs(storePath: string) {
    const files = fs.readdirSync(storePath);

    files.forEach((file) => {
      if (file === '.' || file === '..') {
        return;
      }

      const fullFilePath = path.join(storePath, file);

      if (fs.statSync(fullFilePath).isDirectory()) {
        this.deleteDirs(fullFilePath);
        fs.rmdirSync(fullFilePath);
      } else {
        fs.unlinkSync(fullFilePath);
      }
    });
  }

  protected getFilePath(key: string): string {
    const hashKey = createHash('md5').update(key).digest('hex');
    return path.join(this.dir, hashKey.substr(0, 2), hashKey.substr(2, 2), hashKey);
  }
}
