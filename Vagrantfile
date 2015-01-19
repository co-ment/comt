# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "hashicorp/precise64"

  config.vm.provider :virtualbox do |vb|
    vb.memory = 1024
    vb.cpus = 2
  end

  config.vm.network "forwarded_port", guest: 8000, host: 8000

  config.vm.provision :shell, :path => "etc/provision-vagrant.sh"
end
