#!/bin/bash

echo "Provisioning virtual machine..."

echo "Installing NodeJS"
apt-get update 
apt-get install -y ruby-full build-essential
apt-get install -y nodejs-legacy

echo "Installing npm"
apt-get install -y npm

echo "Installing MonogDB"
apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10

echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.0 multiverse" |  tee /etc/apt/sources.list.d/mongodb-org-3.0.list

apt-get update

apt-get install -y mongodb-org

npm install grunt
 
#chown $USER -R ~./npm
sudo npm install -g grunt-cli grunt bower
npm install
bower install
sudo gem install sass 
sudo service mongodb start
#sudo mkdir -p /data/db
cd /vagrant
#grunt serve

