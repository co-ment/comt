
class sysconfig::postgresql (
    $db_host    = hiera('sysconfig::params::db_host', $sysconfig::params::db_host),
    $db_port    = hiera('sysconfig::params::db_port', $sysconfig::params::db_port),
    $db_name    = hiera('sysconfig::params::db_name', $sysconfig::params::db_name),
    $db_user    = hiera('sysconfig::params::db_user', $sysconfig::params::db_user),
    $db_pw      = hiera('sysconfig::params::db_pw', $sysconfig::params::db_pw),
) inherits sysconfig::params {

    notify {'postgresql': name => "\$db_host : ${db_host}, \$db_port : ${db_port}, \$db_name : ${db_name}, \$db_user : ${db_user}, \$db_pw : ${db_pw}", withpath => true }

    if $sysconfig::params::db_is_local {
        class { 'postgresql::server': }

        postgresql::server::role {"${db_user}_createdb":
            username      => $db_user,
            createdb      => true,
            password_hash => postgresql_password($db_user, $db_pw)
        }->
        postgresql::server::database { $db_name:
            owner    => $db_user,            
            encoding => 'UTF8',
        }
    }
    else {
        class { 'postgresql::client': }->
        postgresql::validate_db_connection { 'validate_postgres_connection':
            database_host           => $db_host,
            database_port           => $db_port,
            database_username       => $db_user,
            database_password       => $db_pw,
            database_name           => $db_name,
        }
    }
}
