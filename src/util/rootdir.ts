import { getRootDir } from 'node-rootdir';

// TODO: import.meta.url
export const rootdir = getRootDir('qoq-sequelize', {
  esmodule: './es',
  commonjs: './lib',
  source: './src',
});
