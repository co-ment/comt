#!/bin/bash

cd "$(dirname "$0")"

nodePath=`node -e "console.log(process.execPath.replace('\/bin\/node', '/lib/node_modules'))"`

export NODE_PATH=$nodePath

wait

../../../node_modules/.bin/yuitest ../tests/cli/loader.js
