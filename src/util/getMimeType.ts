import mimeTypes from 'mime-types';
import LRU from 'lru-cache';

const cache = new LRU<string, string>(100);

export const getMimeType = (type: string): string => {
  let mimeType = cache.get(type);

  if (!mimeType) {
    mimeType = mimeTypes.contentType(type) || type;
    cache.set(type, mimeType);
  }

  return mimeType;
};
