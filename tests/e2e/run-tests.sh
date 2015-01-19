#!/bin/bash

set -ex

# TODO: this script MUST be run from the project root.

ROOT=`pwd`
TESTS=$ROOT/tests/e2e/

mkdir -p $ROOT/log

echo "Starting server"
nohup ./manage.py testserver --noinput \
  initial_data roles_generic test_suite 2>&1 > $ROOT/log/server.log &
TESTSERVER_PID=$!
echo "Server started with pid=" $TESTSERVER_PID
sleep 5

echo "Starting Karma runner"
cd $TESTS
$ROOT/node_modules/karma/bin/karma start --single-run

echo "Cleaning up"
kill $TESTSERVER_PID
rm -f $ROOT/log/server.log
