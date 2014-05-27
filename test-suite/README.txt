
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
sudo apt-get install npm (*) (**)

sudo npm install -g karma karma-mocha	# install things in /usr/local/lib/node_modules/
sudo npm install -g git://github.com/Siltaar/karma-e2e-dsl # to get the improved karma-e2e-dsl


(*) Note for Ubuntu 12.04 LTS (aka 'precise'): version of npm in ubuntu repositories isn't supported any more, you've got to uninstall nodejs and npm (if necessary) and (re-) install from another repository:
sudo apt-get purge nodejs npm
sudo apt-get update
sudo apt-get install -y python-software-properties python g++ make
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install nodejs

Also, for Ubuntu 12.04 LTS, browsers launchers are not included with karma, you need to install them separately:

sudo npm install -g karma-chrome-launcher karma-firefox-launcher

(**) Note for Debian: sudo ln /usr/bin/nodejs /usr/bin/node	# /usr/share/doc/nodejs/README.Debian

Starting the test-suite :
-------------------------
cd comt/test-suite
cp workspace.info.js.example workspace.info.js
vi workspace.info.js	# Customize tested workspace settings
./start-test-suite.sh

