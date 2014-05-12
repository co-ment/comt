#!/bin/bash

PID=$(cat /tmp/testserver.pid|cut -d"|" -f1)
OUTFILE=$(cat /tmp/testserver.pid|cut -d"|" -f2)

echo "Kill test server pid $PID"
kill $PID

echo "Test server log:"
echo "================================================================================"
cat "$OUTFILE"
echo "================================================================================"

echo "Clean testserver output"
rm "$OUTFILE"

