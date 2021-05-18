#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const isESM = typeof require === 'undefined';
const files = ['./src/console', './lib/console', './console'];

function js(ext: '.js' | '.cjs' | '.mjs') {
  let jsFile: string | undefined;

  for (let i = 0; i < files.length; ++i) {
    const file = path.resolve(files[i] + ext);

    if (fs.existsSync(file)) {
      jsFile = file;
      break;
    }
  }

  if (jsFile) {
    import(jsFile);
    return true;
  }

  return false;
}

function ts() {
  let tsFile: string | undefined;

  for (let i = 0; i < files.length; ++i) {
    const file = path.resolve(files[i] + '.ts');

    if (fs.existsSync(file)) {
      tsFile = file;
      break;
    }
  }

  if (tsFile) {
    // User should install ts-node manually
    if (isESM) {
      import('ts-node/esm/transpile-only.mjs').then(() => {
        import(tsFile!);
      });
    } else {
      import('ts-node/register/transpile-only').then(() => {
        import(tsFile!);
      });
    }

    return true;
  }

  return false;
}

if (!js('.js') && !js(isESM ? '.mjs' : '.cjs') && !ts()) {
  console.error(
    chalk.red('Command entry file console.{ts|js|mjs|cjs} is not found.'),
  );
  process.exit(127);
}
