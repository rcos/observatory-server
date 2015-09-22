#!/bin/bash
cd /vagrantchown $USER -R ~/.npm
sudo npm install -g grunt-cli grunt bower
sudo npm install
sudo bower install --allow-root
sudo gem install sass
sudo mkdir -p /data/db
sudo service mongodb start
#grunt serve
