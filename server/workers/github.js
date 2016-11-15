'use strict';

if (!module.parent) {
  // Set default node environment to development
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';

  var mongoose = require('mongoose');
  var config = require('../config/environment');
  var args = process.argv.slice(2);

  // Connect to database
  var db = mongoose.connect(config.mongo.uri, config.mongo.options);
}
var Commit = require('../api/commit/commit.model');
var Project = require('../api/project/project.model');

var octo = require('octonode');
/*
 @TODO: IMPORT TOKEN FROM AN UNTRACKED/PRIVATE CONFIG FILE
 */

var token = config.GITHUB_WORKER_TOKEN;
var octoclient = octo.client(token);

Project.find().exec().then(
  function (projects) {
    projects.forEach(
      function (project) {
        var ghrepo = octoclient.repo(project.fullRepoPath);
        ghrepo.commits(
          function (err, commitDataArray, headers) {
            commitDataArray.forEach(
              function (commitData) {
                var newCommit = new Commit(commitData);

                // super hacky, definitely need to abstract this before github's api changes and this goes boom!!
                newCommit.project = project;
                newCommit.message = commitData.commit.message;
                newCommit.date = commitData.commit.author.date;
                newCommit.commentCount = commitData.commit.comment_count;
                return newCommit.save();
              }
            );
          }
        );
      }
    );
  }
).then(
  function () {
    // @TODO FIX ASYNC ISSUES SO DISCONNECT HAPPENS AFTER ALL SAVES HAVE COMPLETED.
    // Spent like 4 hours trying to debug this, but javascript is just too magical and asynchronous for me =(
    // It works perfectly with db.disconnect commented out, since it will always disconnect before the saves occur...
    // db.disconnect();
    console.log('finished populating commits');
  }
);
