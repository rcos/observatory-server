# Observatory3

[![Build Status](https://travis-ci.org/rcos/observatory-server.svg?branch=master)](https://travis-ci.org/rcos/observatory-server)

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
- [Node.js and npm](https://nodejs.org/) Node ^4.2.3, npm ^2.14.7  (nodejs-legacy for debian-based distributions)
- [Docker](http://https://docs.docker.com/engine/installation/)
- [Docker-Compose](https://docs.docker.com/compose/install/)
- [APIDoc](http://apidocjs.com) (`npm install --g apidoc`)

```
npm install -g apidoc
```

### Developing
1. Run `npm install` to install server dependencies.

    > if you have errors running the above, try:
    > ```
    > sudo chown -R $USER ~/.npm
    > ```

2. Run `bower install` to install front-end dependencies.

3. Run `docker-compose up -d` to start a MongoDB instance.

    This also starts a [Mongo-Express](https://github.com/mongo-express/mongo-express) admin interface available at [http://localhost:8081](http://localhost:8081).

4. Run `npm run dev` to start the development server - the server will now be running at [http://localhost:9000](http://localhost:9000).


## Seeding the Database
Running `docker-compose up` will populate your local MongoDB server with seed data

## Testing
Running `npm test` will run the unit tests with karma.

## Documentation
Running `npm run apidoc` will run generate the `/docs` directory. See [APIDoc](http://apidocjs.com) for more information.
The latest Observatory documentation is hosted at [rcos.github.io/observatory-docs](http://rcos.github.io/observatory-docs)
