#!/bin/bash

echo "Provisioning virtual machine..."

echo "Installing git"
apt-get install -y git

echo "Installing NodeJS"
apt-get update 
apt-get install -y ruby-full build-essential
apt-get install -y nodejs-legacy

echo "Installing npm"
apt-get install -y npm

echo "Installing MongoDB"
apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10

echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.0 multiverse" |  tee /etc/apt/sources.list.d/mongodb-org-3.0.list

#apt-get update

apt-get install -y mongodb-org
 
cd /vagrant
chown $USER -R ~/.npm
sudo npm install -g grunt-cli grunt bower
sudo npm install
sudo bower install --allow-root
sudo gem install sass 
sudo mkdir -p /data/db
sudo service mongod start
grunt serve

