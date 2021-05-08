import { resolve } from 'path';
import { finder } from '../../src/util/finder';

const normalizePath = (file: string) => {
  return resolve('test', 'fixture', 'glob', file).replace(/\\/g, '/');
};

it ('can find .js and .ts files except .d.ts', async () => {
  expect(await finder({ pattern: [finder.resolve('./test/fixture/glob')] })).toMatchObject([
    normalizePath('x.js'),
    normalizePath('x.ts'),
    normalizePath('y.js'),
    normalizePath('y.ts'),
    normalizePath('z.js'),
  ]);

  expect(await finder({ pattern: [finder.resolve('./test/fixture/glob')] })).not.toContain(normalizePath('z.d.ts'));
});

it ('can ignore file by customize', async () => {
  expect(
    await finder({ pattern: [finder.resolve('./test/fixture/glob')], ignore: ['z.js'] })
  ).toContain(normalizePath('z.js'));

  expect(
    await finder({ pattern: [finder.resolve('./test/fixture/glob')], ignore: ['**/z.js'] })
  ).not.toContain(normalizePath('z.js'));

  const matches = await finder({ pattern: [finder.resolve('./test/fixture/glob')], ignore: ['**/z.js', normalizePath('y.js')] });
  expect(matches).not.toContain(normalizePath('z.js'));
  expect(matches).not.toContain(normalizePath('y.js'));
  expect(matches).not.toContain(normalizePath('z.d.ts'));
  expect(matches).toContain(normalizePath('x.js'));

  expect(
    await finder({ pattern: [finder.resolve('./test/fixture/glob')], ignore: ['**/z.js', '**/y.js'] })
  ).toMatchObject([
    normalizePath('x.js'),
    normalizePath('x.ts'),
    normalizePath('y.ts'),
  ]);
});

it ('can find files by customize', async () => {
  expect(await finder({ pattern: [resolve('./test/fixture/glob/**/*.txt')] })).toMatchObject([
    normalizePath('o.txt'),
  ]);

  expect(await finder({ pattern: ['./test/fixture/glob/**/*.txt'] })).not.toContain(normalizePath('x.js'));

  expect(await finder({ pattern: ['./test/fixture/glob/**/*.txt'] })).not.toContain(normalizePath('i.json'));
});

it ('can match empty file list', async () => {
  expect(await finder({ pattern: [finder.resolve('./test/fixture/glob1')] })).toHaveLength(0);
});
