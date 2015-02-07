'use strict';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var https = require('https'); 
var mongoose = require('mongoose');
var config = require('../config/environment');

var github = require('./github')
var Project = require('../api/project/project.model')
var Commit = require('../api/commit/commit.model')

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

var projects = Project.find(function (err, projects) {
  if (err) return console.error(err);
  for (var i = 0; i < projects.length; i++){
    var project = projects[i];
    console.log('Updating: ' + project.name);
    
    if (project.repositoryType == 'github') {
        var commits = github.getRepositoryCommits(project, function(commits){
            for (var j = 0; j < commits.length; j++){
                var commitData = commits[j];
                var commit = {};
                commit.url = commitData.url;
                commit.sha = commitData.sha;
                commit.message = commitData.commit.message;
                commit.author = {};
                commit.author.login = commitData.author.login;
                commit.author.id = commitData.author.id;
                commit.date = commitData.commit.committer.date;
                Commit.create(commit);

                console.log(commits[j].commit.message);
                console.log(commits[j].author.login);
                console.log(commits[j].commit.committer.date);
                console.log();
            }
        });
    };
  }
}); 
