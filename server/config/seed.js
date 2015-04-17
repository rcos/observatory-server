/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var spawn = require("child_process").spawn;

var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');
var Project = require('../api/project/project.model');
var Commit = require('../api/commit/commit.model');

Thing.find({}).remove(function() {
  Thing.create({
    // name : 'Feed',
    // info : 'View the feed from all project blogs posts and commits',
    // link : '/Feed',
    // type: 'homepage'
  // }, {
  //   name : 'Projects',
  //   info : 'Look at current and past Projects',
  //   link : '/Projects',
  //   type: 'homepage'
  }, {
    name : 'Developers',
    info : 'View current and past RCOS developers',
    link : '/users',
    type: 'homepage'
  }, {
    name : 'Archive',
    info : 'View the past observatory',
    link : 'http://rcos.rpi.edu',
    type: 'homepage'
}, {
    name : '',
    info : '',
    type : 'daycode'
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
  },
  {
    provider: 'local',
    role: 'admin',
    name: 'Aaron',
    email: 'aaron@admin.com',
    password: 'admin',
    github:{
      login: 'agundy'
    }

  }, function() {
      console.log('finished populating users');
    }
  );
});

Project.find({}).remove(function(){
  Project.create({
    name: 'Observatory',
    description: 'Open source project tracking.',
    repositoryUrl: 'https://github.com/rcos/Observatory3',
    repositoryType: 'github',
    githubUsername: 'RCOS',
    githubProjectName: 'Observatory3',
  }, function() {
    console.log('finished populating projects')
  })
});
