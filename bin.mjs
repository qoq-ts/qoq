#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { readPackageUpSync } from 'read-pkg-up';

const isESM = (function () {
  if (typeof require === 'undefined') {
    return true;
  }

  if (readPackageUpSync()?.packageJson.type === 'module') {
    return true;
  }

  return false;
})();

const files = ['./src/console', './lib/console', './console'];

const mjsFile = js('.mjs');
const cjsFile = js('.cjs');
const jsFile = js('.js');
const tsFile = ts();

(() => {
  const loadESM = mjsFile || (isESM && jsFile) || (isESM && tsFile);
  if (loadESM) {
    import('./es/bin.js').then((bin) => bin.loadESM(loadESM));
    return;
  }

  const loadCJS = cjsFile || (!isESM && jsFile) || (!isESM && tsFile);
  if (loadCJS) {
    import('./lib/bin.js').then((bin) => bin.loadCJS(loadCJS));
    return;
  }

  console.error(chalk.red('Command entry file console.{ts|js|mjs|cjs} is not found.'));
  process.exit(127);
})();

function js(ext) {
  for (let i = 0; i < files.length; ++i) {
    const file = path.resolve(files[i] + ext);

    if (fs.existsSync(file)) {
      return file;
    }
  }
}

function ts() {
  for (let i = 0; i < files.length; ++i) {
    const file = path.resolve(files[i] + '.ts');

    if (fs.existsSync(file)) {
      return file;
    }
  }
}
