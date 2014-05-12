class sysconfig::packages {

  $coment_pkgs = [
      'vim',
      'python-setuptools',
      'libpq-dev',
      'python-dev',
      'python-virtualenv',
      'libjpeg8-dev',
      'zlib1g-dev',
      'libtiff5-dev',
      'libfreetype6-dev',
      'liblcms2-dev',
      'libwebp-dev',
      'tcl-dev',
      'tk-dev',
      'python-magic',
      'mercurial',
      'libtidy-dev',
      'libyaml-dev',
      'git-core',
      'pandoc',
      'abiword',
      'libreoffice',
      'libreoffice-script-provider-python',
      'python-uno'
  ]
  
  package { $coment_pkgs: ensure => "installed" }

  #upgrade setuptools
  exec { '/usr/bin/easy_install --upgrade setuptools': require => Package[$coment_pkgs]}

  augeas { "sshd_config":
    context => "/files/etc/ssh/sshd_config",
    changes => [
      "set UseDNS no",
      "set GSSAPIAuthentication no",
    ],
    notify  => Service["sshd"],
  }

  service { "sshd":
    name    => $operatingsystem ? {
      Debian  => "ssh",
      default => "sshd",
    },
    require => Augeas["sshd_config"],
    enable  => true,
    ensure  => running,
  }
}
