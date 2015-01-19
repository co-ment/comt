#!/bin/bash


ROOTPATH="/srv/comt"
TMPFILE=`mktemp`

pushd "$ROOTPATH" > /dev/null

nohup bin/django testserver --settings=cm.settings_dev --noinput --addrport=0.0.0.0:8001 initial_data roles_generic test_suite > $TMPFILE 2>&1 &
echo "$!|$TMPFILE" > /tmp/testserver.pid

cat  /tmp/testserver.pid

popd > /dev/null
