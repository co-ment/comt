puppet-supervisord
==================

Description
-----------

A module to:

1. install supervisord daemon
2. create configurations for programs you want to manage with supervisord
3. optionally handle multiple related programs with groups in supervisord.


Installation
------------

Install `supervisord` as a module in your Puppetmaster's modulepath.

    git clone https://github.com/adedommelin/puppet-supervisord.git /etc/puppetlabs/puppet/modules/supervisord


Example
-------

    node 'node.foo.bar' {
      class { 'supervisord': }

      supervisord::program { 'node_app1':
        command   => '/usr/bin/node server.js',
        user      => 'node-user',
        directory => '/var/www/node.foo.bar/'
      }

      supervisord::program { 'node_app2':
        command   => '/usr/bin/node server2.js',
        user      => 'node-user',
        directory => '/var/www/node.foo.bar/'
      }

      supervisord::group { 'Node Servers':
        group_name => "node_apps",
        names => "node_app1,node_app2"
      }
    }


Miscellaneous
=============

Author
------

* Alexandre De Dommelin <adedommelin@tuxz.net>

License
-------

              DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
                      Version 2, December 2004

   Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>

   Everyone is permitted to copy and distribute verbatim or modified
   copies of this license document, and changing it is allowed as long
   as the name is changed.

              DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
     TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

    0. You just DO WHAT THE FUCK YOU WANT TO.

