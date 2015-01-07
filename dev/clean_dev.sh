#!/usr/bin/env bash

pushd `dirname $0` > /dev/null
SCRIPTPATH=`pwd -P`
popd > /dev/null

ROOTPATH="$SCRIPTPATH/.."

pushd "$ROOTPATH" > /dev/null

rm -rf .installed.cfg .mr.developer.cfg buildout-dev.cfg parts/ eggs/ \
    develop-eggs/ bin/ src/cm/settings_local.py src/cm/settings_dev.py \
    test-suite/workspace.info*.js \
    test-suite/{clean-testserver.sh,karma.conf.dev.js} \
    test-suite/{start-test-suite-dev.sh,start-testserver.sh}

find . -name '*.pyc' -or -name '*.egg-info' | xargs rm -rvf

popd > /dev/null
