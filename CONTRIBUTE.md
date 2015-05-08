## Community

The Comt web site (<http://www.co-ment.org/>) is the place to ask questions,
report bugs, check out the source code or download the releases of Comt.


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