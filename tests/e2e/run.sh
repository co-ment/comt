#!/bin/bash

nohup ./manage.py testserver --noinput \
  initial_data roles_generic test_suite &
TESTSERVER_PID=$!
echo "Server started with pid=" $TESTSERVER_PID
sleep 5

echo "Starting Karma runner"
cd test-suite
karma start --single-run

echo "Cleaning up"
kill $TESTSERVER_PID
rm -f nohup.out
