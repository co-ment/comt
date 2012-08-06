*******
Comt
*******

Presentation
============
Comt is an free software Web-based text annotation platform.

License
=======
GNU AFFERO GENERAL PUBLIC LICENSE
http://www.gnu.org/licenses/agpl.html
for software files

CC-BY
http://creativecommons.org/licenses/by/3.0/
for translation files

Dependencies
============

Environment
-------------
- Postgresql 8.3 or Mysql 5+ or sqlite
- Python 2.5+
- Abiword or Openoffice 3.0+ (headless)
- Pandoc


Requirements
------------
- python
- python magic
- python development headers
- python setuptools
- python pexpect
- python cssutils
- pandoc
- abiword (or headless openoffice and python uno)
- git
- libyaml
(all other python dependencies will be downloaded by buildout)

Installation (development install)
============
1. Install python2.5+ and all required libraries
	(ubuntu users : 'sudo apt-get install python python-magic python-setuptools python-uno libyaml-0-1 python-yaml python-dev git-core python-utidylib python-pexpect python-cssutils')
2. Install pandoc
	(ubuntu users : 'sudo apt-get install pandoc')
3. Install abiword
  (ubuntu users: 'sudo apt-get install abiword')
   Alternatively, install openoffice (headless mode) [used for document conversion]
	(ubuntu users : 'sudo apt-get install sun-java6-jre openoffice.org openoffice.org-headless xvfb')
4. Install/configure database [skip this step if you plan to use a sqlite database]
	4 a) Postgresql
		- Install and configure database server [skip this step if use an external database server] 
		(ubuntu users : 'sudo apt-get install postgresql')		
		- Install database client
		(ubuntu users : 'sudo apt-get install postgresql-client')		
		- Install python database connector: psycopg2
		(ubuntu users : 'sudo apt-get install python-psycopg2')		
	4 b) Mysql
		-  Install and configure mysql server [skip this step if use an external database server]
		(ubuntu users : 'sudo apt-get install mysql-server')		
		- Install database client
		(ubuntu users : 'sudo apt-get install mysql-client')
		- Install python database connector: mysqldb
		(ubuntu users : 'sudo apt-get install python-mysqldb')						
5. Create a database (we recommend UTF8 encoding) and a read/write access to it. [skip this step if you plan to use a sqlite database]
   The database account accessing the database MUST have administrative privileges when running the 'syncdb command' (step 8)
   (The reason for that is that Postgresql requires such privileges to create the C-based stored procedure that we use for full text indexing)
   (ex. postgresql: 'sudo -u postgres createdb -E utf8 -e <db_name>)
6. Setup the project and get dependencies
   - `python bootstrap.py`
   - `./bin/buildout` 
7. Configure Comt to your settings
   - copy settings_local_sample.py to settings_local.py (this file will contain your personal settings)  
   - edit settings_local.py to suit your settings (search for 'YOUR_SETTINGS' occurrences, those are mandatory settings)
8. Create the database structure (and test your database connection)
   - `./bin/django syncdb --settings=settings`
   - `./bin/django migrate --settings=settings`
9. Create basic right management system
   - `./bin/django loaddata roles_generic --settings=settings`
10. Launch development server
   - `./bin/django runserver --settings=settings`
11. Access your Comt instance by pointing your browser to http://127.0.0.1:8000/

Installation (production environment)
=============
This README.txt does not cover in details a production environment because this kind of setup is too platform dependant for us to provide a guide.
A few tips thought:
- recommended way to install it is using apache and wsgi, check out django installation guide at http://www.djangoproject.com/documentation/modpython/
- if you use apache as a frontend, you will need to create {{ APACHE_HOME: usually /var/www }}/.python-eggs and chown it to apache

Upgrade
=======

Normal upgrade
--------------
Upgrading you database should only need one command:
   - `./bin/buildout`
   - `./bin/django migrate --settings=settings`
   
Upgrade from alpha releases
----------------------------
If your database was created using comt alpha prior to the revision 29, here are the commands you should run:
   - `./bin/buildout`
   - `./bin/django syncdb`
   - `./bin/django migrate cm 0001_initial --fake`
   - `./bin/django migrate`

Abiword or Openoffice
=====================
Comt uses either abiword or openoffice to convert documents from ODT, MS Word, etc. to html.
Abiword is a lighter and more performant solution. You have to add the configuration parameter `USE_ABI = True` in your settings_local.py to use Abiword. Otherwise openoffice is used.
To use openoffice, on a development setup, you should make sure no openoffice process is left and launch `soffice -headless "-accept=socket,port=2002;urp;"` to start openoffice in background mode.

Comt uses
============

Javascript libs used (and license) / shipped with the distribution
------------------------------------------------------------------
- Yahoo UI	http://developer.yahoo.com/yui/	BSD License
- JQuery	http://jquery.com/	MIT
- markItUp  http://markitup.jaysalvat.com/home/ MIT/GPL

Python libraries used (and license) / NOT shipped with the distribution
-----------------------------------------------------------------------
- django			http://www.djangoproject.com/					BSD License
- python magic		http://hupp.org/adam/hg/python-magic			permissive BSD style license
- Beautiful soup	http://www.crummy.com/software/BeautifulSoup/	PSF license
- python-chardet	http://chardet.feedparser.org/					LGPL 
- python-feedparser	http://feedparser.org/ 							"Permissive" custom license
- python-imaging	http://www.pythonware.com/products/pil/ 		http://www.pythonware.com/products/pil/license.htm
- python-pytz
- html5lib
- python-simplejson
- python-uno
- python-utidylib
- python-yaml
- python-pexpect
- python-cssutils

Icons 
-----
- Icons derived from FatCow Icon Set http://www.fatcow.com/free-icons/index.bml (Creative Commons Attribution 3.0 License)

FAQ
====
Q1: How can I check the distribution for errors (libraries etc.):
R1: After configuring a database and access in your settings_local.py, you can launch the unit test suite with the following command: `./bin/django test cm`

Q2: I'm getting the following error when launching the migrate command:
`
line 62, in handle
    __import__(app_name + '.management', {}, {}, [''])
  File "/usr/lib/python2.5/site-packages/uno.py", line 300, in _uno_import
    raise ImportError( "type "+ name + "." +x + " is unknown" )
ImportError: type django.contrib.sessions.management. is unknown
`
R2: This is due to a bug in uno (python openoffice bridge) that monkey patches the import system and messes with django's dynamic module loading system. A workaround to launch the migrate command is to set: `UNO_IMPORT = False` in file src/cm/converters/oo_converters.py and then to launch the migrate command. Set the value back to True and relaunch the server to use openoffice as a conversion backend.

Q3: When using  co-ment Drupal module, I want that the name of commentators to be the same as the Drupal username
R3: For this feature (commentator name = drupal login name) to be available, a configuration parameter should be set in settings_local.py: `DECORATED_CREATORS = True`

Q4: I get 'import error' when starting the server (step #9)
R4: Make sure you installed all required python dependencies
                      
Community
=========
The Comt web site http://www.co-ment.org is the place to ask questions, report bugs, check out the source code or download the releases of Comt.

How to contribute
=================

Contribute using mercurial
--------------------------
We use mercurial as our source code management system.

1. Create a mercurial profile (nickname/email) in ~/.hgrc (cf. http://mercurial.selenic.com/quickstart for more info).
   This is important because your name will appear in your changeset once it gets accepted into the mainline
2. Clone the repository `hg clone http://hg.co-ment.org/ comt`
   OR update your copy of the source code: `hg update`
3. Hack, hack
4. Commit locally: `hg commit -m "MY COMMIT MESSAGE"`
5. Export your changeset to a file: `hg export tip > my_patch.txt`
6. Create a ticket describing your change and attach your patch to it: http://www.co-ment.org/newticket
7. We will review the patch as soon as possible. If we judge it acceptable and useful, we will be back to you regarding copyright, licensing and other legalese.

Contribute without using mercurial
----------------------------------
If you don't want to use mercurial, you can also create a ticket (http://www.co-ment.org/newticket) with a few modified files to the bugtracker.
Make sure you leave us a nickname and an email for inclusion in the changelog. Point 7 above also applies to contributions without using mercurial.
 
Translation
===========

Update all po files
---------------------
cd src/cm
../../bin/django makemessages -a
../../bin/django makemessages -d djangojs -a

Compile po files
----------------
cd src/cm
../../bin/django compilemessages

Create new file for lang 'LG'
-----------------------------
cd src/cm
../../bin/django makemessages -l LG -e .html,.txt
../../bin/django makemessages -d djangojs -l LG 
