/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');
var Project = require('../api/project/project.model');
var About = require('../api/about/about.model');

Thing.find({}).remove(function() {
  Thing.create({
    name : 'Feed',
    info : 'View the feed from all project blogs posts and commits',
    link : '/Feed',
  }, {
    name : 'Projects',
    info : 'Look at current and past Projects',
    link : '/Projects' 
  }, {
    name : 'Developers',
    info : 'View current and past RCOS developers',
    link : '/Developers'
  },  {
    name : 'Modular Structure',
    info : 'Best practice client and server structures allow for more code reusability and maximum scalability'
  },  {
    name : 'Optimized Build',
    info : 'Build process packs up your templates as a single JavaScript payload, minifies your scripts/css/images, and rewrites asset names for caching.'
  },{
    name : 'Deployment Ready',
    info : 'Easily deploy your app to Heroku or Openshift with the heroku and openshift subgenerators'
  });
});

User.find({}).remove(function() {
  User.create({
    provider: 'local',
    name: 'Test User',
    email: 'test@test.com',
    password: 'test'
  }, {
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin'
  }, function() {
      console.log('finished populating users');
    }
  );
});

Project.find({}).remove(function(){
  Project.create({
    name: 'Observatory',
    description: 'Open source project tracking.',
    repositoryType: 'github',
    githubUsername: 'RCOS',
    githubProjectName: 'Observatory3',
  }, function() {
    console.log('finished populating projects')
  })
});

//The about seed is commented out because using the database to insert the
//statements into the homepage is not working right now. 
/*About.find({}).remove(function() {
  About.create({
    name : 'Mission Statement',
    info : 'Mission'
  }, {
    name : 'Description',
    info : 'Descriptions'
  }, {
    name : 'Benefits of Being an RCOS Member',
    info : 'Benefits'
  },  {
    name : 'Details',
    info : 'Details'
 
  });
});*/
