class sysconfig::deploy {
    
    # create /var/run/gunicorn folder and insert entry in /etc/rc.local
    file { 'run-folder':
        path    => '/var/run/gunicorn',
        ensure  => 'directory',
        owner   => 'www-data',
        group   => 'www-data',
        mode    => '0775',
    }

    #create run folder for gunicorn
    file { 'rc.local':
        path    => '/etc/rc.local',
        ensure  => 'present',
        mode    => 755,
        owner   => 'root',
        group   => 'root',
        content => template('sysconfig/rc.local.erb')
    }

    # install supervidsord
    class { 'supervisord': }
    
    supervisord::program { 'coment' :
        command      => '/srv/comt/bin/gunicorn -b unix:/var/run/gunicorn/comt.socket cm.wsgi:app',
        user         => 'www-data',
        directory    => '/srv/comt',
        environment  => "PYTHONPATH='/srv/comt/src',PROJECT_PATH='/srv/comt/src/cm'",
        require      => Class['supervisord']
    }

    supervisord::program { 'soffice' :
        command      => '/usr/bin/soffice --headless "--accept=socket,port=2002;urp;"',
        user         => 'vagrant',
        directory    => '/srv/comt',
        autostart    => false,
        numprocs     => 1,
        require      => Class['supervisord']
    }

    exec { 'reload_supervisor' :
        command  => '/usr/bin/supervisorctl update',
        require  => Supervisord::Program['coment']
    }

    #add site
    nginx::resource::upstream { 'coment_app':
        ensure                => present,
        members               => [ 'unix:/var/run/gunicorn/comt.socket' ],
        upstream_fail_timeout => 0,
        require               => Exec['reload_supervisor']
    }

    nginx::resource::vhost { $ipaddress_eth1:
        ensure           => present,
        proxy            => 'http://coment_app',
        proxy_set_header => ['Host $http_host'],
        vhost_cfg_append => {
            'proxy_redirect' => 'off'
        },
        require          => Nginx::Resource::Upstream['coment_app']
    }

}