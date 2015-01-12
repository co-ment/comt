# Comt, free software Web-based text annotation platform

## About

Comt is a free software Web-based text annotation platform.

More info (and a hosted platform) at: <http://www.co-ment.com/>.

## Installation

If you're busy, 

1. Install the following packages (on a Debian or Ubuntu Linux distibution):

    sudo apt-get install -y git-core python-dev g++ libtidy-dev pandoc libpq-dev
    
  Note 1: you can probably find similar packages on other Linux distributions,
  then proceed.
  
  Note 2: at this point we don't have a straightforward recipe to install comt
  Mac OS or Windows.

2. Not run:

    git clone git@git.abilian.com:co-ment/comt.git
    cd comt
    python bootstrap-buildout.py
    bin/buildout -v

3. Then create your database (see below) and create/edit the
   `settings_local.py` file accordingly.

4. Then run:

    bin/django syncdb --settings=settings
    bin/django migrate --settings=settings
    bin/django loaddata roles_generic --settings=settings
    bin/django runserver --settings=settings

5. Now you can point your browser to <http://localhost:8000/>


## License

GNU AFFERO GENERAL PUBLIC LICENSE (<http://www.gnu.org/licenses/agpl.html>)
for software files

CC-BY (<http://creativecommons.org/licenses/by/3.0/>) for translation files

## Dependencies

### Environment

- Postgresql 8.3 or Mysql 5+ or sqlite
- Python 2.5+
- Abiword or Openoffice 3.0+ (headless)
- Pandoc


### Requirements

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


## Installation (development install)

*These are old installation notes, they still need to be updated*.

1. Install python2.5+ and all required libraries

   (ubuntu users, run: `sudo apt-get install python python-magic python-setuptools python-uno libyaml-0-1 python-yaml python-dev git-core python-utidylib python-pexpect python-cssutils`)

2. Install pandoc

   (ubuntu users: `sudo apt-get install pandoc`)

3. Install abiword

  (ubuntu users: `sudo apt-get install abiword`)

  Alternatively, install openoffice (headless mode) (used for document conversion)

  (ubuntu users: `sudo apt-get install sun-java6-jre openoffice.org openoffice.org-headless xvfb`)

4. Install/configure database (skip this step if you plan to use a sqlite database)

  4 a) Postgresql

    - Install and configure database server [skip this step if use an external database server]
      (ubuntu users : `sudo apt-get install postgresql`)

    - Install database client
      (ubuntu users : `sudo apt-get install postgresql-client`)

    - Install python database connector: psycopg2
      (ubuntu users : `sudo apt-get install python-psycopg2`)

  4 b) Mysql

    - Install and configure mysql server [skip this step if use an external database server]
       (ubuntu users : `sudo apt-get install mysql-server`)

    - Install database client
      (ubuntu users : `sudo apt-get install mysql-client`)

    - Install python database connector: mysqldb
      (ubuntu users : `sudo apt-get install python-mysqldb`)

5. Create a database (we recommend UTF8 encoding) and a read/write access to it. (skip this step if you plan to use a sqlite database)

   The database account accessing the database MUST have administrative privileges when running the 'syncdb command' (step 8)
   (The reason for that is that Postgresql requires such privileges to create the C-based stored procedure that we use for full text indexing)
   (ex. postgresql: 'sudo -u postgres createdb -E utf8 -e <db_name>)

6. Setup the project and get dependencies

  - `python bootstrap.py`
  - `./bin/buildout`

7. Configure Comt to your settings

  - copy `settings_local_sample.py` to `settings_local.py` (this file will contain your personal settings)  
  - edit `settings_local.py` to suit your settings (search for `YOUR_SETTINGS` occurrences, those are mandatory settings)

8. Create the database structure (and test your database connection)

   - `./bin/django syncdb --settings=settings`
   - `./bin/django migrate --settings=settings`

9. Create basic right management system

   - `./bin/django loaddata roles_generic --settings=settings`

10. Launch development server

   - `./bin/django runserver --settings=settings`

11. Access your Comt instance by pointing your browser to http://127.0.0.1:8000/


## Installation (Vagrant development box)

The second option is to use the vagrant virtual machine defined in the `dev` folder.

For this you need first to install Vagrant for your platform
(cf. <http://www.vagrantup.com/>), open a terminal in the `dev` folder and
launch the command

    vagrant up

This will create a virtual box, using the private address 172.16.1.2.
An instance of comt can be reached at the following url <http://172.16.1.2/>.

The provisioning tool used is Puppet and the manifest
(cf `dev/manifests/site.pp`) uses some external modules (c.f. `dev/modules/`
except `dev/modules/sysconfig`). These modules are referenced as git submodules.
Therefore you mus ensure that all the submodules have been cloned also.
There are two ways to make this:

- pass the `--recursive` option to `git clone` when cloning the Co-ment repository :
`$ git clone --recursive https://github.com/co-ment/comt.git`

- or on an existing cloned repository : `$ git submodule init && git submodule install`


The installation has the following parameters:

- The root of the project is mapped on `/srv/comt` on the dev box.
- The web server is nginx (<http://nginx.org/>).
- The web pages are served as a wsgi application with gunicorn (<http://gunicorn.org/>).
- The gunicorn processes are monitored by supervisor (<http://supervisord.org/>).
- Openoffice is installed but is not launched as an headless instance (althought it could be easily setup with supervisor).
- The dev box uses a virtual network with the ip 172.16.1.2 (this can be changed in the Vagrant config).
- The box is provisioned using puppet (http://puppetlabs.com/>).
- Most of the configuration is done in the sysconfig module found in `dev/modules/sysconfig`.
- All the other subdirectories of `dev/modules` are puppet modules used during the box provisioning. All the folders are sub-repositories and are checked-out using git.

Moreover, the following parameters are set :

| var name       | default     |
|----------------|-------------|
| db_name        | coment      |
| db_user        | coment_user |
| db_pw          | coment      |
| db_host        | 127.0.0.1   |
| db_port        | 5432        |
| superuser_name | admin       |
| superuser_pw   | dev@co-ment |

These values can be overriden by creating a `custom.yaml` file in the `dev`
folder. The file `custom.yaml.tmpl` gives a template for the format of this file.

If the db_host is empty or 'localhost', or '127.0.0.1', the database is
considered local to the box and a postgresql server is installed in the virtual server.

Otherwise, the server is considered remote and only the postgresql client libraries are installed on the dev box.

Also in this case, the database (db_name) and user (db_user) are not created automatically.

You must ensure that they are already created on the postgresql server with the adequate authorizations, and that the user can connect on the 'remote' server from the dev box.

The creation of the virtual machine will create some files in your source tree (`buildout-dev.cfg, test-suite/start-test-suite-dev.js,...`). These files are necessary to the correct operation of the dev virtual machine and should not be touched. They are generated by Puppet during the provisioning of the Vagrant box. If they need to be adapted you will find them in the `sysconfig` puppet module.

Please note that they should not be added to the versioning tool (git) and are currently already ignored.

After you are done with the virtual machine (or if you need to start afresh) they can be cleaned by launching the `clean-testserver.sh` script. Please note that except the files directly managed by Vagrant,the script clean **all** trace of the virtual machine in the source tree, including the buildout `bin` and `egg` folders.

Please refer to the available online documentation for more details on the various tools used here.


## Installation (production environment)

This README does not cover in details a production environment because this kind of setup is too platform dependant for us to provide a guide.

A few tips thought:

- The recommended way to install it is using apache and wsgi, check out django installation guide at <http://www.djangoproject.com/documentation/modpython/>

- If you use apache as a frontend, you will need to create `{{ APACHE_HOME: usually /var/www }}/.python-eggs` and chown it to the `apache` user.


## Upgrade

### Normal upgrade

Upgrading you database should only need one command:

- `bin/buildout`
- `bin/django migrate --settings=settings`

### Upgrade from alpha releases

If your database was created using comt alpha prior to the revision 29, here are the commands you should run:

- `bin/buildout`
- `bin/django syncdb`
- `bin/django migrate cm 0001_initial --fake`
- `bin/django migrate`


## Abiword or Openoffice ?

Comt uses either abiword or openoffice to convert documents from ODT, MS Word,
etc. to html.

Abiword is a lighter and more performant solution. You have to add the
configuration parameter `USE_ABI = True` in your `settings_local.py` to use
Abiword. Otherwise openoffice is used.

To use openoffice, on a development setup, you should make sure no openoffice
process is left and launch `soffice -headless "-accept=socket,port=2002;urp;"`
to start openoffice in background mode.


## Libraries and assets COMT depends upon

### Javascript libs used (and license) / shipped with the distribution

- Yahoo UI <http://developer.yahoo.com/yui/> (BSD License)
- JQuery <http://jquery.com/> (MIT license)
- markItUp <http://markitup.jaysalvat.com/home/> (MIT/GPL license)

### Python libraries used (and license) / NOT shipped with the distribution

- django <http://www.djangoproject.com/> BSD License
- python magic <http://hupp.org/adam/hg/python-magic> permissive BSD style license
- Beautiful soup <http://www.crummy.com/software/BeautifulSoup/> PSF license
- python-chardet <http://chardet.feedparser.org/> LGPL
- python-feedparser <http://feedparser.org/> "Permissive" custom license
- python-imaging <http://www.pythonware.com/products/pil/> http://www.pythonware.com/products/pil/license.htm
- python-pytz
- html5lib
- python-simplejson
- python-uno
- python-utidylib
- python-yaml
- python-pexpect
- python-cssutils

### Icons

Icons derived from FatCow Icon Set (<http://www.fatcow.com/free-icons/index.bml>) (Creative Commons Attribution 3.0 License)


## FAQ

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


## Community

The Comt web site <http://www.co-ment.org/> is the place to ask questions, report bugs, check out the source code or download the releases of Comt.


## How to contribute

We use GitHub as our collaboration tool.

### Reporting issues

Please use the GitHub issue tracker for the project: <>


### Contribute using Git

We use Git as our source code management system.

You can submit pull request

## Translation

### Update all po files

Run:

    cd src/cm
    ../../bin/django makemessages -a
    ../../bin/django makemessages -d djangojs -a

### Compile po files

Run:

    cd src/cm
    ../../bin/django compilemessages

### Create new file for lang 'LG'

Run:

    cd src/cm
    ../../bin/django makemessages -l LG -e .html,.txt
    ../../bin/django makemessages -d djangojs -l LG
