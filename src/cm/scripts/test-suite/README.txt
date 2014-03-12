
--------------------------------
- COMT test-suite instructions -
--------------------------------


Prerequisite :
--------------
You should have a running comt installation, made from a "comt" hg snapshot.
You should have Firefox and/or Chrome navigators installed. You'll be able to
run the tests against more brothers configuring them in the karma.conf.js file.


Installation :
--------------
apt-get install npm
sudo ln /usr/bin/nodejs /usr/bin/node	# /usr/share/doc/nodejs/README.Debian
sudo npm install -g karma karma-mocha karma-e2e-dsl	# goes here /usr/local/lib/node_modules/

Starting comt :
---------------
cd comt/
./bin/django runserver localhost:8000 --settings=settings


Starting the test-suite :
-------------------------
cd comt/src/cm/scripts
cp workspace.info.js.example workspace.info.js
vi workspace.info.js	# Customize tested workspace settings
./start-test-suite.sh

