# == Definition: supervisord::group
#
# === Examples
#
# supervisord::group { 'Group of Tornado Apps running on multiple ports':
#   group_name      => 'tornado_app_servers',
#   names           => 'tornado_app_10001,tornado_app_10002,tornado_app_10003',
# }
#
# === Authors
#
# Jawaad Mahmood <ideas@jawaadmahmood.com>
#
# === Copyright
#
# Copyright 2014 Jawaad Mahmood
#

define supervisord::group (
  $group_name,
  $names,
  $priority="999"
) {
  file { "/etc/supervisor/conf.d/${group_name}.conf":
    ensure  => 'present',
    content => template('supervisord/group.conf.erb'),
    owner   => 'root',
    group   => 'root',
    mode    => '0644',
    require => Class['supervisord']
  }
}
