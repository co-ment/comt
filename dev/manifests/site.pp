exec {
    'apt_update_site':
      command     => '/usr/bin/apt-get update',
      timeout     => 2400,
      returns     => [ 0, 100 ];
#      refreshonly => true;
}

Exec["apt_update_site"] -> Package <| |>

# upgrade system
class { 'sysconfig::sys_upgrade': }->

# install packages
class { 'sysconfig::packages': }->

# install postgres
class { 'sysconfig::postgresql': }->

# install nginx
class { 'sysconfig::nginx': }->

# create python
class { 'sysconfig::buildout': }->

# write config
class { 'sysconfig::config': }->

# write django_init
class { 'sysconfig::django_init': }->

# config testserver_init
class { 'sysconfig::testserver_init': vagrant_base_path => $vagrant_base_path }->

# deploy
class { 'sysconfig::deploy': }
