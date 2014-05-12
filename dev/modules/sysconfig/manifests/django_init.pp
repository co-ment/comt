class sysconfig::django_init (
    $superuser_name = hiera('sysconfig::params::superuser_name', $sysconfig::params::superuser_name ),
    $superuser_pw   = hiera('sysconfig::params::superuser_pw'  , $sysconfig::params::superuser_pw   )
) inherits sysconfig::params {
    
    notify {'django_init': name => "django init \$superuser_name : ${superuser_name}, \$superuser_pw : ${superuser_pw}", withpath => true }->

    exec { 'syncdb':
        command => '/srv/comt/bin/django syncdb --noinput --migrate',
        user    => 'vagrant' 
    }

    exec { 'loaddata':
        command => '/srv/comt/bin/django loaddata roles_generic',
        user    => 'vagrant',
        require => Exec['syncdb']
    }

    exec { 'createsuperuser':
        command => "/bin/echo \"from django.contrib.auth.models import User; User.objects.create_superuser('${superuser_name}', 'admin@example.com', '${superuser_pw}')\" | /srv/comt/bin/django shell",
        cwd     => '/srv/comt',
        user    => 'vagrant',
        onlyif  => "/bin/echo \"from django.contrib.auth.models import User; exit(User.objects.filter(username='${superuser_name}').count())\" | /srv/comt/bin/django shell",
       require => Exec['syncdb']
    }

}