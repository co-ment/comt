COMT test-suite instructions
============================


Prerequisites
-------------

You should have a running comt installation, made from a "comt" git snapshot.

You gave your database user the right to create databases.

You should have Firefox and/or Chrome navigators installed. You'll be able to
run the tests against more brothers configuring them in the workspace.info.js
file.


Installation
------------

Run:

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

Starting the test-suite
-----------------------

Run:

    cd comt/test-suite
    cp workspace.info.js.example workspace.info.js
    vi workspace.info.js	# Customize tested workspace settings
    ./start-test-suite.sh


Using the Vagrant dev environment
---------------------------------

### Prerequisites

You should have a running Vagrant dev instance form the `dev` folder, following the instruction in the root README file.
The creation process of the Vagrant instance create the script and configuration files adapted to your running virtual machine.

You should have Firefox, Chrome or PhantomJS navigators installed. You'll be able to run the tests against more brothers configuring them in the workspace.info.dev.js file, and installing the corresponding karma launcher.

Also you should have node (+npm) installed and in your path.

### Installation

Run:

    `npm install`

Please note that this will install all necessary node modules in a local `node_modules` folder.

If needed, you can tweak some configuration in the `workspace.info.dev.js` file (the browser for example), but the default configuration should work fine.

### Starting the test-suite

In the current folder, run:

`./start-test-suite-dev.js`
