#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const files = ['./src/console', './lib/console', './console'];

function js() {
  let jsFile: string | undefined;

  for (let i = 0; i < files.length; ++i) {
    const file = path.resolve(files[i] + '.js');

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
    // User should install ts-node
    import('ts-node/register/transpile-only').then(() => {
      import(tsFile!);
    });
    return true;
  }

  return false;
}

if (!js() && !ts()) {
  console.error(chalk.red('Command entry file console.{ts|js} is not found.'));
  process.exit(127);
}
