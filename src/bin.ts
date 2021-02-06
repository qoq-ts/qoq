#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const files = ['./src/console', './lib/console', './console'];

function js() {
  let jsFile: string | undefined = undefined;

  for (let i = 0; i < files.length; ++i) {
    const file = files[i] + '.js';

    if (fs.existsSync(file)) {
      jsFile = path.resolve(file);
      break;
    }
  }

  if (jsFile) {
    require(jsFile);
    return true;
  }

  return false;
};

function ts() {
  let tsFile: string | undefined = undefined;

  for (let i = 0; i < files.length; ++i) {
    const file = files[i] + '.ts';

    if (fs.existsSync(file)) {
      tsFile = path.resolve(file);
      break;
    }
  }

  if (tsFile) {
    // User should install ts-node
    require('ts-node/register');
    require(tsFile);
    return true;
  }

  return false;
}

if (!js() && !ts()) {
  console.error(chalk.red('Command entry file console.{ts|js} not found.'));
  process.exit(127);
}
