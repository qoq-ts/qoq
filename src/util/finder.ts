import glob from 'glob';
import { resolve } from 'path';

export namespace finder {
  export interface Options {
    pattern: string[];
    ignore?: string[];
    dot?: boolean;
  }
}

export const finder = async (opts: finder.Options): Promise<string[]> => {
  const options: glob.IOptions = opts;

  const matches = await Promise.all(
    opts.pattern.map((pattern) => {
      return new Promise<string[]>((resolve, reject) => {
        const ignore = opts.ignore || [];

        ignore.push('**/*.d.ts');
        options.ignore = ignore;
        options.nodir = true;

        glob(pattern, options, (err, matches) => {
          if (err === null) {
            resolve(matches);
          } else {
            reject(err);
          }
        });
      });
    })
  );

  return matches.length > 1 ? [...new Set(matches.flat())] : matches.flat();
};

finder.normalize = (path: string | string[] | finder.Options): finder.Options => {
  if (typeof path === 'string') {
    return {
      pattern: [path],
    };
  }

  if (Array.isArray(path)) {
    return {
      pattern: path,
    };
  }

  return path;
};

finder.resolve = (path: string) => {
  return resolve(path, './**/*.{ts,js}');
};
