#!/bin/bash

#
# Provisionning script for Debian Wheezy.
#

# Exit on error
set -e

#
# Install system packages
#
apt-get update -qq
apt-get install -y git-core python-dev g++ libtidy-dev pandoc libpq-dev
apt-get clean

#
# Prepare & run buildout
#
echo "Installing using buildout"
cd /vagrant
su - vagrant -c "cd /vagrant ; python bootstrap-buildout.py"
su - vagrant -c "cd /vagrant ; bin/buildout -v"

#
# Tests
#
echo "Running unit tests"
su - vagrant -c "cd /vagrant ; ./bin/django test --settings=settings"

#
# Setup
#
echo "Setting up"
su - vagrant -c "cd /vagrant ; ./bin/django syncdb --settings=settings"
su - vagrant -c "cd /vagrant ; ./bin/django migrate --settings=settings"
su - vagrant -c "cd /vagrant ; ./bin/django loaddata roles_generic --settings=settings"

