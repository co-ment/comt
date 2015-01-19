#!/bin/bash

set -ex

HERE=`pwd`

nohup ./manage.py testserver --noinput \
  initial_data roles_generic test_suite &
TESTSERVER_PID=$!
echo "Server started with pid=" $TESTSERVER_PID
sleep 5

echo "Starting Karma runner"
cd test-suite
$HERE/node_modules/karma/bin/karma start --single-run

echo "Cleaning up"
kill $TESTSERVER_PID
rm -f $HERE/nohup.out
