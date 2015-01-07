class sysconfig::buildout {

  file { 'buildout-dev.cfg':
        ensure  => 'present',
        path    => "/srv/comt/buildout-dev.cfg",
        replace => 'yes',
        owner   => 'vagrant',
        group   => 'vagrant',
        mode    => 755,
        source  => 'puppet:///modules/sysconfig/buildout-dev.cfg'
  }

  exec {
    'bootstrap':
      command => '/usr/bin/python bootstrap-buildout.py',
      cwd     => '/srv/comt',
      creates => '/srv/comt/bin',
      user    => 'vagrant';
    'buildout':
      command => '/srv/comt/bin/buildout -c /srv/comt/buildout-dev.cfg',
      cwd     => '/srv/comt',
      timeout => 0,
      creates => '/srv/comt/bin/gunicorn';
  }

  File['buildout-dev.cfg'] -> Exec['bootstrap'] -> Exec['buildout']

}
