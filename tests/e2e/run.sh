#!/bin/bash

TESTSERVER_LOGS=/dev/null

#nohup ./manage.py testserver --noinput \
#  initial_data roles_generic test_suite > $TESTSERVER_LOGS 2>&1 &
nohup ./manage.py testserver --noinput \
  initial_data roles_generic test_suite &
TESTSERVER_PID=$!
echo "pid=" $TESTSERVER_PID
sleep 5

cd test-suite
karma start

kill $TESTSERVER_PID
