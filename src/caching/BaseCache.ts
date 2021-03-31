import { createHash } from 'crypto';

export type BaseCacheOptions = {
  engine: string;
  keyPrefix?: string;
};

export abstract class BaseCache {
  protected readonly keyPrefix: string;

  constructor(config: BaseCacheOptions) {
    this.keyPrefix = config.keyPrefix ?? '';
  }

  async exists(key: string): Promise<boolean> {
    const hashKey = this.buildKey(key);
    const value = await this.getValue(hashKey);

    return value !== null;
  }

  async get<T>(key: string, defaultValue: T): Promise<T>;
  async get<T extends string | number | object | boolean>(key: string): Promise<T | null>;

  async get(key: string, defaultValue?: string | number | object | boolean): Promise<any> {
    const hashKey = this.buildKey(key);
    let result = await this.getValue(hashKey);

    if (result === null) {
      return defaultValue === undefined ? null : defaultValue;
    }

    try {
      return JSON.parse(result);
    } catch {
      return null;
    }
  }

  async getOrSet<T extends string | number | object | boolean>(key: string, orSet: () => T | Promise<T>, ttl?: number): Promise<T> {
    let value: T | null = await this.get(key);

    if (value !== null) {
      return value;
    }

    value = await orSet();
    await this.set(key, value, ttl);
    return value;
  }

  async set(key: string, value: string | number | object | boolean, ttl?: number): Promise<boolean> {
    const hashKey = this.buildKey(key);
    const wrappedValue = JSON.stringify(value);

    return this.setValue(hashKey, wrappedValue, ttl);
  }

  async add(key: string, value: any, ttl?: number): Promise<boolean> {
    const hashKey = this.buildKey(key);
    const wrappedValue = JSON.stringify(value);

    return this.addValue(hashKey, wrappedValue, ttl);
  }

  async delete(key: string): Promise<boolean> {
    const hashKey = this.buildKey(key);
    return this.deleteValue(hashKey);
  }

  async deleteAll(): Promise<boolean> {
    return this.deleteAllValues();
  }

  public/*protected*/ buildKey(key: string): string {
    const hashKey = key.length <= 32 ? key : createHash('md5').update(key).digest('hex');

    return this.keyPrefix + hashKey;
  }

  protected async addValue(key: string, value: string, ttl?: number): Promise<boolean> {
    const exist = await this.exists(key);

    if (!exist) {
      return this.setValue(key, value, ttl);
    }

    return false;
  }

  protected abstract getValue(key: string): Promise<string | null>;
  protected abstract setValue(key: string, value: string, ttl?: number): Promise<boolean>;
  protected abstract deleteValue(key: string): Promise<boolean>;
  protected abstract deleteAllValues(): Promise<boolean>;
}
