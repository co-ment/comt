# == Definition: supervisord::program
#
# === Examples
#
# supervisord::program { 'node_app':
#   command   => '/usr/bin/node server.js',
#   user      => 'node-user',
#   directory => '/var/www/node.foo.bar/'
# }
#
# === Authors
#
# Alexandre De Dommelin <adedommelin@tuxz.net>
#
# === Copyright
#
# Copyright 2013 Alexandre De Dommelin
#
define supervisord::program (
  $command,
  $process_name             = '%(program_name)s',
  $numprocs                 = '1',
  $directory                = '',
  $umask                    = '022',
  $priority                 = '999',
  $autostart                = true,
  $autorestart              = true,
  $startsecs                = '1',
  $startretries             = '3',
  $exitcodes                = '0,2',
  $stopsignal               = 'TERM',
  $stopwaitsecs             = '10',
  $user                     = 'root',
  $redirect_stderr          = false,
  $stdout_logfile           = 'AUTO',
  $stdout_logfile_maxbytes  = '50MB',
  $stdout_logfile_backups   = '10',
  $stdout_capture_maxbytes  = '0',
  $stdout_events_enabled    = false,
  $stderr_logfile           = 'AUTO',
  $stderr_logfile_maxbytes  = '50MB',
  $stderr_logfile_backups   = '10',
  $stderr_capture_maxbytes  = '0',
  $stderr_events_enabled    = false,
  $environment              = '',
  $serverurl                = 'AUTO'
) {
  file { "/etc/supervisor/conf.d/${name}.conf":
    ensure  => 'present',
    content => template('supervisord/program.conf.erb'),
    owner   => 'root',
    group   => 'root',
    mode    => '0644',
    require => Class['supervisord']
  }
}
