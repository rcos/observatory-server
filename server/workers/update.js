'use strict';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var https = require('https'); 
var mongoose = require('mongoose');
var config = require('../config/environment');

var github = require('./github')
var Project = require('../api/project/project.model')
var Commit = require('../api/commit/commit.model')
var User = require('../api/user/user.model')

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

var saveCommit = function(commit, callback){

}

var projects = Project.find(function (err, projects) {
  if (err) return console.error(err);
  
  projects.forEach(function(project) {
    console.log("Updating: " + project.name);
    if(project.repositoryType === 'github'){
        var commits = github.getRepositoryCommits(project, function(commits){
            commits.forEach(function(commitData) {
                User.findOne({githubLogin: commitData.author.login}, '_id githubLogin', function(err, user){
                    var commit = {};
                    commit.url = commitData.url;
                    commit.sha = commitData.sha;
                    commit.message = commitData.commit.message;
                    commit.author = {};
                    commit.author.login = commitData.author.login;
                    commit.author.id = commitData.author.id;
                    commit.date = commitData.commit.committer.date;

                    if (user) {
                        commit.userId = user._id;
                    };
                    console.log(commit);

                    Commit.create(commit);
                })
            });
        });
    }
  });
}); 
