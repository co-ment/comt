class sysconfig::testserver_init (
    $superuser_name    = hiera('sysconfig::params::superuser_name'   ,$sysconfig::params::superuser_name   ),
    $superuser_pw      = hiera('sysconfig::params::superuser_pw'     ,$sysconfig::params::superuser_pw     ),
    $user_edit_name    = hiera('sysconfig::params::user_edit_name'   ,$sysconfig::params::user_edit_name   ),
    $user_edit_pw      = hiera('sysconfig::params::user_edit_pw'     ,$sysconfig::params::user_edit_pw     ),
    $user_com_name     = hiera('sysconfig::params::user_com_name'    ,$sysconfig::params::user_com_name    ),
    $user_com_pw       = hiera('sysconfig::params::user_com_pw'      ,$sysconfig::params::user_com_pw      ),
    $user_observ_name  = hiera('sysconfig::params::user_observ_name' ,$sysconfig::params::user_observ_name ),
    $user_observ_pw    = hiera('sysconfig::params::user_observ_pw'   ,$sysconfig::params::user_observ_pw   ),
    $testserver_port   = hiera('sysconfig::params::testserver_port'  ,$sysconfig::params::testserver_port  ),
    $vagrant_base_path

) inherits sysconfig::params {

    notify {'testserver_init': name => "testserver init : \$superuser_name : ${superuser_name}, \$superuser_pw : ${superuser_pw}", withpath => true }->

    file { 'karma_workspace_info':
        ensure  => 'present',
        path    => "/srv/comt/test-suite/workspace.info.js",
        replace => 'no',
        owner   => 'vagrant',
        group   => 'vagrant',
        mode    => 644,
        content => template('sysconfig/workspace.info.js.erb','sysconfig/url.workspace.info.js.erb'),
    }

    file { 'karma_workspace_info_dev':
        ensure  => 'present',
        path    => "/srv/comt/test-suite/workspace.info.dev.js",
        replace => 'no',
        owner   => 'vagrant',
        group   => 'vagrant',
        mode    => 644,
        content => template('sysconfig/workspace.info.js.erb','sysconfig/url.test.workspace.info.js.erb'),
    }

    file { 'clean-testserver.sh':
        ensure  => 'present',
        path    => "/srv/comt/test-suite/clean-testserver.sh",
        replace => 'no',
        owner   => 'vagrant',
        group   => 'vagrant',
        mode    => 755,
        source  => 'puppet:///modules/sysconfig/clean-testserver.sh'
    }

    file { 'karma.conf.dev.js':
        ensure  => 'present',
        path    => "/srv/comt/test-suite/karma.conf.dev.js",
        replace => 'no',
        owner   => 'vagrant',
        group   => 'vagrant',
        mode    => 644,
        source  => 'puppet:///modules/sysconfig/karma.conf.dev.js'
    }

    file { 'start-test-suite-dev.sh':
        ensure  => 'present',
        path    => "/srv/comt/test-suite/start-test-suite-dev.sh",
        replace => 'no',
        owner   => 'vagrant',
        group   => 'vagrant',
        mode    => 755,
        content => template('sysconfig/start-test-suite-dev.sh.erb')
    }

    file { 'start-testserver.sh':
        ensure  => 'present',
        path    => "/srv/comt/test-suite/start-testserver.sh",
        replace => 'no',
        owner   => 'vagrant',
        group   => 'vagrant',
        mode    => 755,
        content => template('sysconfig/start-testserver.sh.erb')
    }

    file { 'settings_dev':
        ensure  => 'present',
        path    => "/srv/comt/src/cm/settings_dev.py",
        replace => 'no',
        owner   => 'vagrant',
        group   => 'vagrant',
        mode    => 644,
        content => template('sysconfig/settings_dev.py.erb')
    }

}
