# Observatory3

[![Build Status](https://travis-ci.org/rcos/Observatory3.svg?branch=master)](https://travis-ci.org/rcos/Observatory3)

A project tracking dashboard for Rensselaer Center for Open Source. A ground up rewrite.

Working to replace a system with these [features](docs/Legacy_Features.md).
See our [planned feature set.](docs/Feature_Requirements.md)

## Features

Observatory is a powerful dashboard tracking open source projects and contributors that are built through Rensselaer Center for Open Source. The current implemenation can be seen in action at [rcos.io](http://rcos.io). We are a highly active community of open source developers that attend school at Rensselaer.

Key Features Include

- Project Tracking
- Individual Progress reports
- Attendance system for users
- Information gathering and blog platform for projects

## Getting Started
### Prerequisites
- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node ^4.2.3, npm ^2.14.7  (nodejs-legacy for debian-based distributions)
- [MongoDB](https://www.mongodb.org/) - Keep a running daemon with `mongod`


- [Bower](bower.io) (`npm install --global bower`)
- [Grunt](http://gruntjs.com/) (`npm install --global grunt-cli`)
```
npm install -g grunt-cli grunt bower
```

### Developing
1. Run `npm install` to install server dependencies.

    > if you have errors running the above, try:
    > ```
    > sudo chown $USER -R ~/.npm`
    > ```

2. Run `bower install` to install front-end dependencies.
3. Run `mongod` in a separate shell to keep an instance of the MongoDB Daemon running (or run continuously with `sudo service mongodb start` or equivalent if not on an ubuntu-based distribution)
    > if mongodb fails to start, run the following line and retry:
    >
    > ```
    > sudo mkdir -p /data/db
    > ```

4. Run `grunt serve` to start the development server. It should automatically open the client in your browser when ready.

    Grunt will run the server and make the project available at [http://localhost:9000](http://localhost:9000).


## Build & preview
Run `grunt build` for building and `grunt serve` for preview.

## Testing
Running `npm test` will run the unit tests with karma.

Want to develop with us?
This project was generated with the [Angular Full-Stack Generator](https://github.com/DaftMonk/generator-angular-fullstack) version 3.3.0.
