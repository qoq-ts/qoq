import glob from 'glob';
import path from 'path';

export namespace finder {
  export interface Options {
    pattern: string[];
    ignore?: string[];
    dot?: boolean;
  }

  export type Paths = string | string[] | finder.Options | finder.Options[];
}

const isString = (data: string[] | finder.Options[]): data is string[] => {
  return typeof data[0] === 'string';
}

const flat = (matches: string[][]): string[] => {
  switch (matches.length) {
    case 0:
      return [];
    case 1:
      return matches[0]!;
    default:
      return [...new Set(matches.flat())];
  }
};

export const finder = async (opts: finder.Options[]): Promise<string[]> => {
  const matches = await Promise.all(
    opts.map(async (opt) => {
      const options: glob.IOptions = opt;

      const matches = await Promise.all(
        opt.pattern.map((pattern) => {
          return new Promise<string[]>((resolve, reject) => {
            const ignore = opt.ignore || [];

            if (!glob.hasMagic(pattern)) {
              pattern = path.resolve(pattern, './**/*.{ts,js}');
            }

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

      return flat(matches);
    })
  );

  return flat(matches);
};

finder.normalize = (pattern: finder.Paths): finder.Options[] => {
  if (typeof pattern === 'string') {
    return [
      {
        pattern: [pattern],
      }
    ];
  }

  if (Array.isArray(pattern)) {
    if (!pattern.length) {
      return [];
    }

    if (isString(pattern)) {
      return [
        {
          pattern: pattern,
        }
      ];
    }

    return pattern;
  }

  return [pattern];
};
