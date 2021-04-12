import { BaseCacheOptions } from './BaseCache';

export const initCache = <T extends BaseCacheOptions>(config: T) => {
  return new config.engine(config);
};
