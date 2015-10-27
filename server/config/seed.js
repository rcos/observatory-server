/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var spawn = require("child_process").spawn;

var User = require('../api/user/user.model');
var Project = require('../api/project/project.model');
var Commit = require('../api/commit/commit.model');
var ClassYear = require('../api/classyear/classyear.model')

User.find({}).remove(function() {
  User.create({
    provider: 'local',
    name: 'Test User',
    email: 'test@test.com',
    password: 'test',
    github: {
        login: "test"
    }
  }, {
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin'
  },
  {
    provider: 'local',
    role: 'mentor',
    name: 'Mentor',
    email: 'mentor@mentor.com',
    password: 'mentor',
    github: {
      login: 'mentorguy'
    }
  },
   function() {
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

ClassYear.find({}).remove(function(){
  ClassYear.create({
    semester: '1970fall',
    current: true
  });
});
