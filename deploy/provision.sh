#!/bin/sh

# Provisionning script for Ubuntu.

# Basics
apt-get update -qq && apt-get install -y python-psycopg2 libpq-dev \
  postgresql-client git-core python-pip python-dev g++ mercurial

# Libreoffice
apt-get install -y libreoffice-base-core libreoffice-calc libreoffice-common \
  libreoffice-core libreoffice-emailmerge libreoffice-math \
  libreoffice-style-human libreoffice-writer python-uno

apt-get install -y python-dev python-virtualenv python-pip git \
  build-essential imagemagick libpq-dev libxslt1-dev npm unoconv \
  libjpeg-dev python-tox virtualenvwrapper poppler-utils

pip install -U tox pip
