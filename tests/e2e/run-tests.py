#!/usr/bin/env python

import os
import sys
from subprocess import Popen, call
from os.path import abspath, dirname, join
from time import sleep

TESTS = abspath(dirname(__file__))
ROOT = abspath(join(TESTS, "..", ".."))

ENV = os.environ.copy()
ENV['NO_MAIL'] = "true"


def main():
    call("mkdir -p {ROOT}/log".format(ROOT=ROOT), shell=True)

    server = None
    try:
        server = start_server()
        status = run_tests()
        sys.exit(status)
    finally:
        server.kill()


def start_server():
    logfile = open("{ROOT}/log/test-server.log".format(ROOT=ROOT), "wbc")
    cmd = "cd {ROOT} ; ./manage.py testserver --noinput initial_data roles_generic test_suite"
    cmd = cmd.format(ROOT=ROOT)
    print ">", cmd
    server = Popen(cmd, shell=True, env=ENV, stdout=logfile, stderr=logfile)
    print "Server started with pid = {}".format(server.pid)
    sleep(5)
    return server


def run_tests():
    cmd = "cd {TESTS} ; ../../node_modules/karma/bin/karma start --single-run".format(
        TESTS=TESTS)
    print ">", cmd
    return call(cmd, shell=True)


def clean_up(server):
    if server:
        print "Stopping test server"
        server.kill()


main()
