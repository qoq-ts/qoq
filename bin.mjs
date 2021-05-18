#!/usr/bin/env node

import { createRequire } from 'module';
import { readPackageUpSync } from 'read-pkg-up';

if (isESModule()) {
  import('./es/bin.js');
} else {
  createRequire(import.meta.url)('./lib/bin.js');
}

function isESModule() {
  if (typeof require === 'undefined') {
    return true;
  }

  if (readPackageUpSync()?.packageJson.type === 'module') {
    return true;
  }

  return false;
}
