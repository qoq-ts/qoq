#!/usr/bin/env node

import { spawn } from 'child_process';
import { hideBin } from 'yargs/helpers';

const isTS = (file: string) => /\.ts$/.test(file);

export const loadESM = (file: string) => {
  if (isTS(file)) {
    const node = process.argv[0]!;
    const args = hideBin(process.argv);
    const nodeOptions = [
      '--no-warnings',
      '--loader=ts-node/esm/transpile-only',
      '--experimental-specifier-resolution=node',
    ];

    spawn(node, nodeOptions.concat(file).concat(args), {
      stdio: 'inherit',
    });
  } else {
    import(file);
  }
};

export const loadCJS = (file: string) => {
  if (isTS(file)) {
    import('ts-node/register/transpile-only').then(() => {
      import(file);
    });
  } else {
    import(file);
  }
};
