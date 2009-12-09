*******
Comt
*******

Presentation
============
Comt is the open source version of co-ment, a Web-based text annotation platform.

License
=======
GNU AFFERO GENERAL PUBLIC LICENSE
http://www.gnu.org/licenses/agpl.html

Dependencies
============

Environment
-------------
- Postgresql 8.3 / Mysql 5+ / sqlite
- Python 2.5+
- Openoffice 3.0+ & Pandoc


Requirements
------------
- python (GPL compatible license)
- python magic	(permissive BSD style license)
- python development headers	(GPL compatible license)
- python setuptools (PSF or ZPL - GPL compatible)
- python uno (GPL)
- pandoc
- headless openoffice
- git (GPL)
- libyaml (permissive license)
(all other python dependencies will be downloaded by buildout)

Installation (development install)
============
1. Install python2.5+ and all required libraries
	(ubuntu users : 'sudo apt-get install python python-magic python-setuptools python-uno libyaml-0-1 python-dev git-core')
2. Install pandoc
	(ubuntu users : 'sudo apt-get install pandoc')
3. Install openoffice (headless mode) [used for document conversion]
	(ubuntu users : 'sudo apt-get install sun-java6-jre openoffice.org openoffice.org-headless xvfb)
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
If you'd like to install Comt on a production environment, check out django installation guide at http://www.djangoproject.com/documentation/modpython/

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

Openoffice
==========
Comt uses openoffice to convert documents from ODT, MS Word, etc. to html.
On a development setup, you should make sure no openoffice process is left and launch
`soffice -headless "-accept=socket,port=2002;urp;"` to start openoffice in background mode.

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

Icons 
-----
- Icons derived from FatCow Icon Set http://www.fatcow.com/free-icons/index.bml (Creative Commons Attribution 3.0 License)

FAQ
====
Q: I get 'import error' when starting the server (step #9)
R: Make sure you installed all required python dependencies
                      
Community
=========
The Comt web site http://www.co-ment.org is the place to ask questions, report bugs, check out the source code or download the releases of Comt.

Credits
========
We'd like to thank:
- Kirill Miazine (http://km.krot.org/) for the norwegian translation
