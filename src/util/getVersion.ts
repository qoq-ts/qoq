import fs from 'fs';
import path from 'path';

let version: string;

export const getVersion = (): string => {
  if (!version) {
    try {
      if (fs.existsSync(path.join(__dirname, '..', 'package.json'))) {
        version = require('../package.json').version;
      } else if (fs.existsSync(path.join(__dirname, '..', '..', 'package.json'))) {
        version = require('../../package.json').version;
      }
    } finally {
      if (!version) {
        version = '0.0.0';
      }
    }
  }

  return version;
};
