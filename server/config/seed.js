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
var ClassYear = require('../api/classyear/classyear.model')
var Attendance = require('../api/attendance/attendance.model')
var Achievement = require('../api/achievement/achievement.model');


// Seed the database with the original sample data
var seed = function() {
    // load list of users
    var users = require('./seed/users.json');
    var projects = require('./seed/projects.json');
    var posts = require('./seed/posts.json');
    var smallgroups = require('./seed/smallgroups.json');
    var attendances = require('./seed/attendance.json');
    var classyears = require('./seed/classyears.json');
    var achievements = require('./seed/achievements.json');

    var user = User.remove({}).exec()
        .then(function() {
            return User.create(users);
        })
        .then(function(){
            console.log('finished populating users');
        });

    var project = Project.remove({}).exec()
        .then(function(){
            return Project.create(projects)
        })
        .then(function() {
            console.log('finished populating projects')
        });

    var post = Post.remove({}).exec()
        .then(function(){
            return Post.create(posts)
        })
        .then(function() {
            console.log('finished populating posts')
        });

    var smallgroup = Smallgroup.remove({}).exec()
        .then(function(){
            return Smallgroup.create(smallgroups)
        })
        .then(function() {
            console.log('finished populating smallgroups')
        });

    var attendance = Attendance.remove({}).exec()
        .then(function(){
            return Attendance.create(attendances)
        })
        .then(function() {
            console.log('finished populating attendances')
        });
    var achievement = Achievement.remove({}).exec()
        .then(function(){
            return Achievement.create(achievements)
        })
        .then(function() {
            console.log('finished populating achievements')
        })

    var classYear = ClassYear.remove({}).exec()
        .then(function(){
            return ClassYear.create(classyears)
        })
        .then(function() {
            console.log('finished populating class years')
        })

    return Promise.all([user, project, post, smallgroup, attendance, achievement, classYear ]);
}

if (!module.parent) {
    if (args.length == 0) {
        seed().then(function(){

            db.disconnect()
        });
    }
}

exports.seed = seed;
