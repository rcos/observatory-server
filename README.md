Observatory3
============

[![Build Status](https://travis-ci.org/rcos/Observatory3.svg?branch=master)](https://travis-ci.org/rcos/Observatory3)

A project tracking dashboard for Rensselaer Center for Open Source. A ground up rewrite.

Working to replace a system with these [features](docs/Legacy_Features.md).
See our [planned feature set.](docs/Feature_Requirements.md)

Features
--------

Observatory is a powerful dashboard tracking open source projects and contributors that are built through Rensselaer Center for Open Source. the current implemenation can be seen in action at [rcos.rpi.edu](http://rcos.rpi.edu). We are a highly active community of open source developers that attend school at Rensselaer.

Key Features Include

- Project Tracking
- Individual Progress reports
- Attendance system for users
- Information gathering and blog platform for projects

Installation
------------

Once the project is cloned you need nodejs (nodejs-legacy for debian-based distributions), npm, ruby, and Mongo DB. You can then run
```
npm install -g grunt-cli grunt bower
npm install
# if you have errors running the above, run the following line:
sudo chown $USER -R ~/.npm
bower install
sudo gem install sass
sudo service mongodb start # or equivalent if not on an ubuntu-based distribution
# if mongodb fails to start, run the following line and retry:
sudo mkdir -p /data/db
grunt serve
```

Grunt will run the server and make the project available at [http://localhost:9000](http://localhost:9000). 

Want to develop with us? Check out the generator we use at [here](https://github.com/DaftMonk/generator-angular-fullstack). 
