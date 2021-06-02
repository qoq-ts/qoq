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
};

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

export const finder = (opts: finder.Options[]): Promise<string[]> => {
  return Promise.all(
    opts.map((opt) => {
      const options: glob.IOptions = opt;
      const ignore = opt.ignore || [];

      ignore.push('**/*.d.ts');
      options.ignore = ignore;
      options.nodir = true;

      return Promise.all(
        opt.pattern.map(
          (pattern) =>
            new Promise<string[]>((resolve, reject) => {
              if (!glob.hasMagic(pattern)) {
                pattern = path.resolve(pattern, './**/*.{ts,js}');
              }

              glob(pattern, options, (err, matches) => {
                if (err === null) {
                  resolve(matches);
                } else {
                  reject(err);
                }
              });
            }),
        ),
      ).then(flat);
    }),
  ).then(flat);
};

finder.normalize = (pattern: finder.Paths): finder.Options[] => {
  if (typeof pattern === 'string') {
    return [
      {
        pattern: [pattern],
      },
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
        },
      ];
    }

    return pattern;
  }

  return [pattern];
};
