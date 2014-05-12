class sysconfig::params {

  $db_name = 'coment'
  $db_user = 'coment_user'
  $db_pw   = 'coment'
  $db_host = '127.0.0.1'
  $db_port = '5432'

  $db_host_real = hiera('sysconfig::params::db_host',$db_host)
  $db_is_local = ($db_host_real == undef or !$db_host_real or $db_host_real=='127.0.0.1' or $db_host_real=='localhost')

  $testserver_port = 8001

  $superuser_name   = 'admin'
  $superuser_pw     = 'dev@co-ment'
  $user_edit_name   = 'user-edit'
  $user_edit_pw     = 'user-edit@co-ment'
  $user_com_name    = 'user-com'
  $user_com_pw      = 'user-com@co-ment'
  $user_observ_name = 'user-observ'
  $user_observ_pw   = 'user-observ@co-ment'

}
