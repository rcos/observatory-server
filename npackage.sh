#!/bin/bash
chown $USER -R ~/.npm
sudo npm install -g grunt-cli grunt bower --no-bin-links
sudo npm install --no-bin-links
sudo bower install --allow-root
sudo gem install sass
sudo mkdir -p /data/db
sudo service mongodb start
#grunt serve
