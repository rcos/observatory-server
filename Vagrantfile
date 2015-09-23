Vagrant.configure("2") do |config|

	#VM Basebox Type
	config.vm.box = "ubuntu/trusty64" 

	#VM Port configuration	
	config.vm.network "forwarded_port", guest:9000, host:9000, auto_correct: true

	#Synced folder details	
	#config.vm.synced_folder "./", "/vagrant", create: true, group: "vagrant", owner: "vagrant"

	#VM specific configurations
	config.vm.provider "virtualbox" do |v|
		v.name = "Observatory3 Dev Vagrant"
		v.customize ["modifyvm", :id, "--memory", "1024"]
		v.customize ["modifyvm", :id, "--usb", "off"]
		v.customize ["modifyvm", :id, "--usbehci", "off"]

    	v.customize ["sharedfolder", "add", :id, "--name", "www", "--hostpath", (("//?/" + File.dirname(__FILE__) + "/www").gsub("/","\\"))]
	end

	# Automatically create www directory on host if it doesn't exist
	unless File.directory?(File.dirname(__FILE__) + "/www")
	  FileUtils.mkdir_p(File.dirname(__FILE__) + "/www")
	end

	
	#Provisioning script details
	config.vm.provision "shell", path: "vagrant.sh"

	config.vm.provision :shell, inline: "mkdir /home/vagrant/www"
	config.vm.provision :shell, inline: "mount -t vboxsf -o uid=`id -u vagrant`,gid=`getent group vagrant | cut -d: -f3` www /home/vagrant/www", run: "always"

end
