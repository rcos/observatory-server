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

// var updateProjectCommits = function() {
//   // var projects
//   Project.find().exec().then(function (projects) {
//     projects.forEach(function (project) {
//       console.error("PROJECT: ", project.fullRepoPath);
//       var ghrepo = octoclient.repo(project.fullRepoPath);
//       ghrepo.commits(
//         function (err, commitDataArray, headers) {
//           commitDataArray.forEach(function (commitData) {
//             //console.log("creating ....");
//             return Commit.create(commitData);
//           });
//         });
//     });
//   });
// }

Project.find().exec().then(function (projects) {
  var responses = [];
  projects.forEach(function (project) {
    console.error("PROJECT: ", project.fullRepoPath);
    var ghrepo = octoclient.repo(project.fullRepoPath);
    var r = ghrepo.commits(
        function (err, commitDataArray, headers) {
          console.log(err,commitDataArray);
          commitDataArray.forEach(
            function (commitData) {
            //console.log("creating ....");
              commitData["projectId"] = project.id;
              console.log("projectId:", commitData.projectId);
              console.log(commitData);
              console.log(Object.getOwnPropertyNames(commitData));
              throw new Error('abort abort abort ABORT');
              return Commit.create(commitData);
          });
          // console.error(err, headers);
        }
      );
    responses.push(r);
  });
  // console.error("responses", responses);
}).then(function() {
  db.disconnect();
  console.log('finished populating commits');
});
// if (!module.parent) {
//   if (args.length == 0) {
//     seed().then(function(){
//
//       db.disconnect()
//     });
//   }
// }
//
// projects.forEach(function(project) {
//     console.error("PROJECT: ", project.fullRepoPath);
//     var ghrepo = octoclient.repo(project.fullRepoPath);
//     ghrepo.commits(
//       function(err, commitDataArray, headers) {
//       commitDataArray.forEach(function(commitData) {
//         console.log(commitData);
//         //Commit.create(commitData);
//       });
//     });
//   });
// function getCommitsForRepository(repoOwner, repoName, callback){
//         /*
//         	ex: github.com/<repoOwner>/<repoName>
//         	repoOwner: github username for owner of github repo
//         	repoName: github repo name
//
//             example:
//             	repoOwner: rcos
//             	repoName: Observatory3
//         */
//         var githubRepo = repoOwner + "/" + repoName;
//         var ghrepo = octoclient.repo(githubRepo);
//         var commits = ghrepo.commits(function(err, data, headers) {
//             //@TODO: add logic to create a commit model & save it to DB
//         	return data;
//         });
//       /*
//        not sure if callback is even needed... doesn't make sense with current function naming;
//        maybe would be better to refactor function name to specify that it applies callback to list of commits from repo?
//        or maybe this is just a javascript convention, and having callbacks everywhere is normal?
//        */
//       return callback(commits);
// };
//         // @TODO: remove/cleanup; just using this as a reference for now...
//     // 	var pushEvents = ghuser.events(['PushEvent'], function(ignore, pushEvents){
//     //         if (!pushEvents){
//     //             return callback([]);
//     //         }
//     //         var strings = [];
//     //     	for (var i = 0; i < pushEvents.length;i++){
//     //     		var payload = pushEvents[i].payload;
//     //     		var commits = payload.commits;
//     //     		for (var u = 0; u < commits.length; u++){
//     //     			strings.push(commits[u].message);
//     //     		}
//     //     	}
//     //     	callback(strings);
//     //     });
//     // });
// // };
