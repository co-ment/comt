# == Class: supervisord
#
# Manage supervisord
#
# === Examples
#
#  class { supervisord: }
#
# === Authors
#
# Alexandre De Dommelin <adedommelin@tuxz.net>
#
# === Copyright
#
# Copyright 2013 Alexandre De Dommelin
#
class supervisord {
  package { 'supervisor':
    ensure => present
  }

  case $::operatingsystem {
    centos: {
      $supervisord_config   = '/etc/supervisord.conf'
      $supervisord_service  = 'supervisord'
    }
    redhat: {
      $supervisord_config   = '/etc/supervisord.conf'
      $supervisord_service  = 'supervisord'
    }
    debian: {
      $supervisord_config   = '/etc/supervisor/supervisord.conf'
      $supervisord_service  = 'supervisor'
    }
    ubuntu: {
      $supervisord_config   = '/etc/supervisor/supervisord.conf'
      $supervisord_service  = 'supervisor'
    }
    default: {
      fail("Module ${module_name} is not supported on ${::operatingsystem}")
    }
  }

  File {
    owner => 'root',
    group => 'root',
    mode  => '0644'
  }

  file { '/etc/supervisor':
    ensure  => 'directory',
    require => Package['supervisor']
  } -> file { '/etc/supervisor/conf.d':
    ensure  => 'directory'
  } -> file { $supervisord_config:
    source  => 'puppet:///modules/supervisord/supervisord.conf',
    owner   => 'root',
    group   => 'root',
    mode    => '0644'
  } -> service { $supervisord_service:
    ensure  => 'running',
    enable  => true
  }
}
