class sysconfig::config(
  $db_name = hiera('sysconfig::params::db_name',$sysconfig::params::db_name),
  $db_user = hiera('sysconfig::params::db_user',$sysconfig::params::db_user),
  $db_pw   = hiera('sysconfig::params::db_pw',$sysconfig::params::db_pw),
  $db_host = hiera('sysconfig::params::db_host',$sysconfig::params::db_host),
  $db_port = hiera('sysconfig::params::db_port',$sysconfig::params::db_port)
) inherits sysconfig::params {

  notify {'config': name => "config -> \$db_host: ${db_host}, \$db_port: ${db_port}, \$db_name: ${db_name}, \$db_user: ${db_user}, \$db_pw: ${db_pw}", withpath => true }

  file { 'local-settings':
     ensure  => 'present',
     path    => "/srv/comt/src/cm/settings_local.py",
     replace => 'no',
     owner   => 'vagrant',
     group   => 'vagrant',
     mode    => 644,
     content => template('sysconfig/settings_local.py.erb'),
   }
 
   file { 'media-root':
     ensure => 'directory',
     path   => '/srv/comt/web',
     owner  => 'www-data',
     group  => 'www-data',
     mode   => '0775'
   }

}
