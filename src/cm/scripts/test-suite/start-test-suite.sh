#!/bin/bash

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

if [ -x ./node_modules/.bin/karma ]; then
   KARMA=./node_modules/.bin/karma
else
   KARMA=`which karma`
fi

"$KARMA" start $@


