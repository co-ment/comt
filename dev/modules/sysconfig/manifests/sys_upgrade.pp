class sysconfig::sys_upgrade {

  exec {
    'apt_get_update_sysconfig':
      command     => '/usr/bin/apt-get update',
      timeout     => 2400,
      returns     => [ 0, 100 ];
#      refreshonly => true;
    'sys-upgrade':
      command   => '/usr/bin/apt-get upgrade -y',
      timeout => 0,
      require   => Exec['apt_get_update_sysconfig'];
    'sys-dist-upgrade':
      command   => '/usr/bin/apt-get dist-upgrade -y',
      timeout => 0,
      require   => Exec['apt_get_update_sysconfig'];
  }

  Exec['sys-upgrade'] -> Exec['sys-dist-upgrade']
  
}
