import { Cache, CacheOptions } from './Cache';

export const configMemoryCache = (config: MemoryCacheOptions = {}): [typeof MemoryCache, MemoryCacheOptions] => {
  return [MemoryCache, config];
};

export interface MemoryCacheOptions extends CacheOptions {}

interface MemoryData {
  k: string;
  v: string;
  ttl: number;
};

export class MemoryCache extends Cache {
  private data: MemoryData[] = [];

  protected async getValue(key: string): Promise<any> {
    const data = this.data.find((item) => item.k === key);

    if (data && (data.ttl === 0 || data.ttl > Date.now())) {
      return data.v;
    }

    return null;
  }

  protected async setValue(key: string, value: string, duration: number): Promise<boolean> {
    const index = this.data.findIndex((item) => item.k === key);
    const serialize: MemoryData = {
      k: key,
      v: value,
      ttl: duration === 0 ? 0 : Date.now() + duration,
    };

    if (index >= 0) {
      this.data[index] = serialize;
    } else {
      this.data.push(serialize);
    }

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
    this.data = this.data.filter((item) => item.k !== key);
    return true;
  }

  protected async deleteAllValues(): Promise<boolean> {
    this.data = [];
    return true;
  }
}
