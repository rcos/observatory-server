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

var Octokat = require('octokat');
/*
 @TODO: IMPORT TOKEN FROM AN UNTRACKED/PRIVATE CONFIG FILE
 */
mongoose.Promise = require('bluebird');

var gtoken = config.GITHUB_WORKER_TOKEN;
var octo = new Octokat({
  token: gtoken
});
var cb = function (err, val) {
  if(err) {
    console.log(err);
    throw new Error();
  }
  console.log(val);
  console.log(val.length);
  return val.length;
};



function fetchCommitsFromProject (owner, project) {
  console.log(owner, project,'000');
  return fetchAll(octo.repos(owner,project).commits.fetch, [])
}

function fetchAll (fetch, results) {
  console.log(fetch, results, '456');

  return fetchUntil(fetch, results, () => false)
}

function fetchUntil (fetch, results, done) {
  // console.log(fetch, results, done, '123');
  return new Promise((resolve, reject) => {
    fetch()
    .then(result => {
    results = results.concat(result);

  if (result.nextPage && ! done(result)) {
    return resolve(fetchUntil(result.nextPage, results, done))
  }

  resolve(results)
})
.catch(reject)
})
}
var saveCommit = function (commitData) {
  console.log('saviing....');
  var newCommit = new Commit(commitData);

  // super hacky, definitely need to abstract this before github's api changes and this goes boom!!
  newCommit.project = project;
  newCommit.message = commitData.commit.message;
  newCommit.date = commitData.commit.author.date;
  newCommit.commentCount = commitData.commit.comment_count;
  return newCommit.save();
};
var saveCommits = function(commits) {
  console.log("comm len", commits.length, commits[0].length);
  var commitPromises = [];
  commits[0].forEach(function(commit) {
    console.log('pre-save...');
    commitPromises.push(saveCommit(commit));
  });
  console.log("cpro len", commitPromises.length);
  return Promise.all(commitPromises);
};
var fetchCommits = function (owner, project) {
  return Promise.all([fetchCommitsFromProject(owner, project)]);
};
if (!module.parent) {
  if (args.length == 0) {

    fetchCommits('rcos', 'Observatory3').then(saveCommits).then(function (val) {
      console.log(val);
      console.log(val.length);
      console.log(Object.keys(val));
      console.log(Object.getOwnPropertyNames(val));
      console.log("gg?");
    });
  }
}
// Project.find().exec().then(
//   function (projects) {
//     var promises = [];
//     projects.forEach(
//       function (project) {
//         console.log('test start...');
//         var owner = project.githubUsername;
//         var proj = project.githubProjectName;
//         console.log('...');
//         promises.push(fetchCommit(owner,proj));//octo.repos(owner,proj).commits.fetch()
//           // .then(); //commits.fetchAll(cb);
//         // console.log(test);
//         // throw new Error();
//       }
//     );
//     return Promise.all(promises);
//   }
// ).then(
//   function () {
//     // @TODO FIX ASYNC ISSUES SO DISCONNECT HAPPENS AFTER ALL SAVES HAVE COMPLETED.
//     // Spent like 4 hours trying to debug this, but javascript is just too magical and asynchronous for me =(
//     // It works perfectly with db.disconnect commented out, since it will always disconnect before the saves occur...
//     // db.disconnect();
//     console.log('finished populating commits');
//   }
// );
