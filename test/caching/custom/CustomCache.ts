import { BaseCache } from '../../../src';

export interface CustomCacheOptions {
  slot: './test/caching/custom/CustomCache',
  test: boolean;
}

class CustomCache extends BaseCache {
  protected async getValue(): Promise<string | null> {
    return null;
  }
  protected async setValue(): Promise<boolean> {
    return true;
  }
  protected async deleteValue(): Promise<boolean> {
    return true;
  }
  protected async deleteAllValues(): Promise<boolean> {
    return true;
  }
}

export default CustomCache;
