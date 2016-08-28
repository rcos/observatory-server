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


// Seed the database with the original sample data
var seed = function(cb) {
    // load list of users
    var users = require('./seed/users.json');
    var projects = require('./seed/projects.json');
    var posts = require('./seed/posts.json');
    var smallgroups = require('./seed/smallgroups.json');

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

    Promise.all([user, project, post, smallgroup, classYear]).then(function(res){
        cb();
    });
}

if (!module.parent) {
    if (args.length == 0) {
        seed(function(){
            db.disconnect()
        });
    }
}

exports.seed = seed;
