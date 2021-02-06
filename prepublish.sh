#!/usr/bin/env bash

set -e

rm -rf ./es/ ./lib/ ./types/

rm -rf ./build
./node_modules/.bin/tsc
mv ./build/src ./lib

rm -rf ./build
./node_modules/.bin/tsc --module ES6
mv ./build/src ./es

mv ./build/types/src ./types
