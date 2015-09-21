Vagrant.configure("2") do |config|

	#VM Basebox Type
	config.vm.box = "ubuntu/trusty64" 

	#VM Port configuration	
	config.vm.network "forwarded_port", guest:9000, host:9000, auto_correct: true

	#Synced folder details	
	config.vm.synced_folder "./", "/vagrant", create: true, group: "vagrant", owner: "vagrant"

	#VM specific configurations
	config.vm.provider "virtualbox" do |v|
		v.name = "Observatory3 Dev Vagrant"
		v.customize ["modifyvm", :id, "--memory", "1024"]
		v.customize ["modifyvm", :id, "--usb", "off"]
		v.customize ["modifyvm", :id, "--usbehci", "off"]
	end
	
	#Provisioning script details
	config.vm.provision "shell", path: "vagrant.sh"

end
