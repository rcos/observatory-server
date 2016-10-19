/**
 *  Handle Seeding the database via Grunt
 */

'use strict';

if (!module.parent) {
    // Set default node environment to development
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';

    var mongoose = require('mongoose');
    var config = require('./environment');
    var args = process.argv.slice(2);

    // Connect to database
    var db = mongoose.connect(config.mongo.uri, config.mongo.options);
}

var Promise = require('promise');

var User = require('../api/user/user.model');
var Project = require('../api/project/project.model');
var Post = require('../api/post/post.model');
var Smallgroup = require('../api/smallgroup/smallgroup.model');
var ClassYear = require('../api/classyear/classyear.model');
var Commit = require('../api/commit/commit.model');
var GithubWorker = require('../workers/github');


// Seed the database with the original sample data
var seed = function() {
    // load list of users
    var users = require('./seed/users.json');
    var projects = require('./seed/projects.json');
    var posts = require('./seed/posts.json');
    var smallgroups = require('./seed/smallgroups.json');
// var d = 
// console.error('d',d);
var promises = [];
    var user = User.remove({}).exec()
        .then(function() {
            return User.create(users);
        })
        .then(function(){
            console.log('finished populating users');
        });
    promises.push(user);
    var project = Project.remove({}).exec()
        .then(function(){
            return Project.create(projects)
        })
        .then(function() {
            console.log('finished populating projects')
        });
    promises.push(project);
     Commit.remove({}).exec()
        .then(function(){
            // var allCommitPromises = [];
         for (var i = 0;i<projects.length;i++) {
            var projectCommitPromise = GithubWorker.getCommitsForRepository(projects[i].githubUsername, 
            projects[i].githubProjectName, function(data) {
                var x = Commit.create(data);
                console.error('???????',x);
                promises.push(x);
                return x;
        });
            console.error('1',projects[i].githubProjectName,projectCommitPromise);
            // allCommitPromises.push(projectCommitPromise);
        }
        // console.error('psize',allCommitPromises.length);
        // return allCommitPromises;
    });
        // promises.push(commit);
    var post = Post.remove({}).exec()
        .then(function(){
            return Post.create(posts)
        })
        .then(function() {
            console.log('finished populating posts')
        });
    promises.push(post);

    var smallgroup = Smallgroup.remove({}).exec()
        .then(function(){
            return Smallgroup.create(smallgroups)
        })
        .then(function() {
            console.log('finished populating smallgroups')
        });
    promises.push(smallgroup);

    var classYear = ClassYear.remove({}).exec()
        .then(function(){
            return ClassYear.create({
                semester: '2016Spring',
                current: true,
                displayURP: false,
                dayCodes: [
                  {
                    date: "2016-05-15T04:00:00.000Z",
                    code: "1W2O8J",
                    bonusDay: false
                  }
                ],

            })
        })
        .then(function() {
                console.log('finished populating class years')
            })
    promises.push(classYear);
    return Promise.all(promises);
}

if (!module.parent) {
    if (args.length == 0) {
        seed().then(function(){
            db.disconnect()
        });
    }
}

exports.seed = seed;
