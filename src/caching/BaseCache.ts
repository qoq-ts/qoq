import { createHash } from 'crypto';

export type BaseCacheOptions = {
  slot: string;
  keyPrefix?: string;
  ttl?: number;
};

export abstract class BaseCache {
  protected readonly keyPrefix: string;
  protected readonly defaultTTL: number;

  constructor(config: BaseCacheOptions) {
    this.keyPrefix = config.keyPrefix ?? '';
    this.defaultTTL = config.ttl ?? 0;
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

  async getOrSet<T extends string | number | object | boolean>(key: string, orSet: () => T | Promise<T>, duration: number = this.defaultTTL): Promise<T> {
    let value: T | null = await this.get(key);

    if (value !== null) {
      return value;
    }

    value = await orSet();
    await this.set(key, value, duration);
    return value;
  }

  async set(key: string, value: string | number | object | boolean, duration: number = this.defaultTTL): Promise<boolean> {
    const hashKey = this.buildKey(key);
    const wrappedValue = JSON.stringify(value);

    return this.setValue(hashKey, wrappedValue, duration);
  }

  async add(key: string, value: any, duration: number = this.defaultTTL): Promise<boolean> {
    const hashKey = this.buildKey(key);
    const wrappedValue = JSON.stringify(value);

    return this.addValue(hashKey, wrappedValue, duration);
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

  protected abstract getValue(key: string): Promise<string | null>;
  protected abstract setValue(key: string, value: string, duration: number): Promise<boolean>;
  protected abstract addValue(key: string, value: string, duration: number): Promise<boolean>;
  protected abstract deleteValue(key: string): Promise<boolean>;
  protected abstract deleteAllValues(): Promise<boolean>;
}
