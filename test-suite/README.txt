
--------------------------------
- COMT test-suite instructions -
--------------------------------


Prerequisite :
--------------
You should have a running comt installation, made from a "comt" hg snapshot.
You gave your database user the right to create databases.
You should have Firefox and/or Chrome navigators installed. You'll be able to
run the tests against more brothers configuring them in the workspace.info.js
file.


Installation :
--------------
apt-get install npm
sudo ln /usr/bin/nodejs /usr/bin/node	# /usr/share/doc/nodejs/README.Debian
sudo npm install -g karma karma-mocha karma-e2e-dsl	# goes here /usr/local/lib/node_modules/


Starting comt :
---------------
cd comt/
./bin/django testserver localhost:8001 --noinput initial_data roles_generic test_content


Starting the test-suite :
-------------------------
cd comt/src/cm/scripts
cp workspace.info.js.example workspace.info.js
vi workspace.info.js	# Customize tested workspace settings
./start-test-suite.sh

