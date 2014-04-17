#!/bin/bash

echo "Starting test server"

TESTSERVER_LOGS="/tmp/django_test_server_logs.`date +%F_%T`"

cd ..
nohup ./bin/django testserver --noinput localhost:8000 initial_data roles_generic test_suite > $TESTSERVER_LOGS 2>&1 &
TESTSERVER_PID=$!
cd "test-suite"

# Exports browsers _BIN variables for karma
export CHROME_BIN=`which chromium`
if [ -z "$CHROME_BIN" ]; then
	export CHROME_BIN=`which chrome`
fi
if [[ -z "$CHROME_BIN" && $OSTYPE =~ ^darwin ]]; then
	CHROME_BIN_BASE=`mdfind "kMDItemCFBundleIdentifier == 'com.google.Chrome'"`
	export CHROME_BIN="$CHROME_BIN_BASE/Contents/MacOS/Google Chrome"
fi
export PHANTOMJS_BIN=`which phantomjs`

export FIREFOX_BIN=`which firefox`
if [[ -z "$FIREFOX_BIN" && $OSTYPE =~ ^darwin ]]; then
	FIREFOX_BIN_BASE=`mdfind "kMDItemCFBundleIdentifier == 'org.mozilla.firefox'"`
	export FIREFOX_BIN="$FIREFOX_BIN_BASE/Contents/MacOS/firefox"
fi

export SAFARI_BIN=`which safari`
if [[ -z "$SAFARI_BIN" && $OSTYPE =~ ^darwin ]]; then
	SAFARI_BIN_BASE=`mdfind "kMDItemCFBundleIdentifier == 'com.apple.Safari'"`
	export SAFARI_BIN="$SAFARI_BIN_BASE/Contents/MacOS/safari"
fi

if [ -x ./node_modules/.bin/karma ]; then
   KARMA=./node_modules/.bin/karma
else
   KARMA=`which karma`
fi


CONNECTION_TIMEOUT=10
TESTSERVER_START_WAIT=15
TESTSERVER_LOOP_WAIT=5
TESTSERVER_WAIT_LOOP_NB=5

SERVER_IP=`grep WORKSPACE_URL workspace.info.js | sed "s|^.*http://\([-._[:alnum:]]*\):.*$|\1|"`
SERVER_PORT=`grep WORKSPACE_URL workspace.info.js | sed "s|^.*http://[-._[:alnum:]]*:\([0-9]*\)/.*$|\1|"`

if [[ -x `which nc` ]]; then
	SERVER_TEST_CMD="nc -w $CONNECTION_TIMEOUT -z $SERVER_IP $SERVER_PORT"
elif [[ -x `which curl` ]]; then
	SERVER_TEST_CMD="curl -m $CONNECTION_TIMEOUT --output /dev/null --silent --head --fail http://$SERVER_IP:$SERVER_PORT"
elif [[ -x `which wget` ]]; then
	SERVER_TEST_CMD="wget --timeout=$CONNECTION_TIMEOUT -q --spider http://$SERVER_IP:$SERVER_PORT"
fi

echo "Using '$SERVER_TEST_CMD' to probe test server $SERVER_IP:$SERVER_PORT availability"

if [[ -z "$SERVER_TEST_CMD" ]]; then
	echo "No http tool available so blindly waiting $TESTSERVER_START_WAIT seconds to let test server start"
	sleep $TESTSERVER_START_WAIT
else
	for i in $(seq 1 $TESTSERVER_WAIT_LOOP_NB); do
		echo "and waiting $TESTSERVER_LOOP_WAIT seconds"
		sleep $TESTSERVER_LOOP_WAIT
		if $SERVER_TEST_CMD; then
			break
		fi
	done
	if [ $i -eq $TESTSERVER_WAIT_LOOP_NB ]; then
		 echo "timeouted waiting for test server $SERVER_IP:$SERVER_PORT to start"
		 exit 1
	fi
fi

echo "---------------------"
echo "$KARMA start $@"
"$KARMA" start $@
# echo "Kill test server pid $TESTSERVER_PID"
# echo "---------------------"
# kill $TESTSERVER_PID

