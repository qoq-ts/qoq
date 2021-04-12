#!/usr/bin/env bash

set -e

rm -rf ./es/ ./lib/ ./types/

rm -rf ./build
./node_modules/.bin/tsc
mv ./build/src ./lib

rm -rf ./build
./node_modules/.bin/tsc --module es2020
mv ./build/src ./es

npx public-refactor --src ./src --dist ./build/types/src
mv ./build/types/src ./types
