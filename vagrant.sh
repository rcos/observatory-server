#!/bin/bash

echo "Provisioning virtual machine..."

echo "Installing git"
apt-get update 
apt-get install -y git

echo "Installing g++"
apt-get install -y g++

echo "Installing NodeJS"

apt-get install -y ruby-full build-essential
apt-get install -y nodejs-legacy

echo "Installing npm"
apt-get install -y npm

echo "Installing MongoDB"
#apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10

#echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.0 multiverse" |  tee /etc/apt/sources.list.d/mongodb-org-3.0.list

#apt-get update

#apt-get install -y mongodb-org

apt-get install -y mongodb
