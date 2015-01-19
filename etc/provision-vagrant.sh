#!/bin/bash

#
# Provisionning script for Debian Wheezy.
#

# Exit on error
set -ex

#
# Install system packages
#
apt-get update -qq
apt-get install -y git-core libtidy-dev libpq-dev pandoc
apt-get install -y python-dev python-pip python-virtualenv
apt-get clean

#
# Prepare & run buildout
#
echo "Installing using buildout"
cd /vagrant
su - vagrant -c "cd /vagrant ; virtualenv env"
su - vagrant -c "cd /vagrant ; env/bin/pip install -e ."

#
# Tests
#
echo "Running unit tests"
su - vagrant -c "cd /vagrant ; env/bin/python manage.py test cm"

#
# Setup
#
echo "Setting up"
su - vagrant -c "cd /vagrant ; env/bin/python manage.py syncdb"
su - vagrant -c "cd /vagrant ; env/bin/python manage.py migrate"
su - vagrant -c "cd /vagrant ; env/bin/python manage.py loaddata roles_generic"

