class sysconfig::buildout {

  exec {
    'bootstrap':
      command => '/usr/bin/python bootstrap.py',
      cwd     => '/srv/comt',
      creates => '/srv/comt/bin',
      user    => 'vagrant';
    'buildout':
      command => '/srv/comt/bin/buildout -c /srv/comt/buildout-prod.cfg',
      cwd     => '/srv/comt',
      timeout => 0,
      creates => '/srv/comt/bin/gunicorn';
  }

  Exec['bootstrap'] -> Exec['buildout']

}
