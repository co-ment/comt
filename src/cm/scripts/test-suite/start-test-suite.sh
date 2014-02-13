#!/bin/bash

export CHROME_BIN=`whereis chromium | sed -r 's/[^ ]* ([^ ]*).*/\1/g' -`
karma start

