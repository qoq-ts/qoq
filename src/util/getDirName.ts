import { dirname } from 'path';
import { fileURLToPath } from 'url';

const isESM = typeof require === 'undefined';

export const getDirName = (url: string) => {
  if (isESM) {
    return dirname(getFileName(url));
  }

  return url;
};

export const getFileName = (url: string) => {
  if (isESM) {
    return fileURLToPath(url);
  }

  return url;
};
