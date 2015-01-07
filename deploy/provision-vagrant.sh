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

# Overkill list of packages to install
apt-get install -y `cat /vagrant/deploy/packages.list`


#apt-get upgrade -y

# Basics
#apt-get install -y python-psycopg2 libpq-dev postgresql-client \
#  git-core python-pip python-dev g++ mercurial

#apt-get install -y \
#  build-essential imagemagick libpq-dev libxslt1-dev \
#  libjpeg-dev poppler-utils libtidy-dev python-magic pandoc

# Libreoffice
#apt-get install -y python-uno

#apt-get install -y libreoffice-common libreoffice-core \
#  libreoffice-style-galaxy python-uno



#apt-get install -y \
#      vim \
#      python-setuptools \
#      libpq-dev \
#      python-dev \
#      python-virtualenv \
#      libjpeg8-dev \
#      zlib1g-dev \
#      libtiff5-dev \
#      libfreetype6-dev \
#      liblcms2-dev \
#      libwebp-dev \
#      tcl-dev \
#      tk-dev \
#      python-magic \
#      mercurial \
#      libtidy-dev \
#      libyaml-dev \
#      git-core \
#      pandoc \
#      abiword \
#      libreoffice \
#      libreoffice-script-provider-python \
#      python-uno

#
# Installing/upgrading more stuff via pip (needed?)
#
#pip install -U tox pip setuptools

#
#
#
cd /vagrant

#
# We need this stuff direct from hg. Bummer.
#
if [ ! -d mercurial-recipe ] ; then 
  hg clone https://bitbucket.org/pagenoare/mercurial-recipe
fi
cd mercurial-recipe
pip install -e .
cd ..


#
# Install via buildout
#
echo "Installing using buildout"
su - vagrant -c "cd /vagrant ; python bootstrap-buildout.py"
su - vagrant -c "cd /vagrant ; bin/buildout -v"


#
# Setup
#
echo "Setting up"
su - vagrant -c "cd /vagrant ; ./bin/django syncdb --settings=settings"
su - vagrant -c "cd /vagrant ; ./bin/django migrate --settings=settings"
su - vagrant -c "cd /vagrant ; ./bin/django loaddata roles_generic --settings=settings"


#
# Cleanup
#
apt-get clean

