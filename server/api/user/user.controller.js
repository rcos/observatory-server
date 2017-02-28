'use strict';

var _ = require('lodash');
var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var async = require('async');
var email = require("../../components/email");
var Commit = require('../commit/commit.model');
var ClassYear = require('../classyear/classyear.model');
var Attendance = require('../attendance/attendance.model');
var SmallGroup = require('../smallgroup/smallgroup.model');

// Return a standard error
function handleError(res, err) {
    return res.sendStatus(500, err);
}

var validationError = function(res, err) {
  return res.status(422).json(err);
};

/**
 * Get list of users
 */
exports.index = function(req, res) {
  User.find({}, function (err, users) {
    if(err) return res.send(500, err);
    res.status(200).json(users);
  });
};

/**
 * Get user stats
 */
exports.publicStats = function(req, res) {
  async.parallel([
        // Count active users
        function(callback) {
          User.count({active:true}, function (err, aCount) {
            if (err) return callback(err);
            callback(null, aCount);
          });
        },
        // Count past users
        function(callback) {
          User.count({active:false}, function (err, pCount) {
            if (err) return callback(err);
            callback(null, pCount);
          });
        },
      ],
      function(err, results){
        if (err) {
          return res.send(400);
        }

        if (results === null) {
          return res.send(400);
        }

        //results contains [activeProjectCount, pastProjectCount]
        var stats = {};
        stats.activeUsers = results[0] || 0;
        stats.pastUsers = results[1] || 0;

        return res.status(200).send(stats);
  });
};

/**
 * Returns user or list of users that match a supplied query
 *
 * Takes {query:String, single:Boolean, limit:Integer}
 */
 // TODO Make this work with fuzzy queries, multiple results etc.
exports.search = function(req, res){
    if (!req.query.query) return res.send(400, "No query supplied");
    var query = new RegExp(["^", req.query.query, "$"].join(""), "i")
    User.findOne({name: query}, function(err, user){
        if (err) return res.send(500, err);
        if (!user){
            if (req.query.single){
                return res.status(200).json(null);
            }else{
                return res.status(200).json([]);
            }
        }
        if (req.query.single){
            return res.status(200).json(user.profile);
        }else{
            return res.status(200).json([user.profile]);
        }
    });
};

/**
 * Get list of users with stats including last commits
 * in previous 2 weeks
 * restriction: 'admin'
 */
exports.stats = function(req, res) {
  // Only return users who are active and have a github login
  User.find({active: true, 'github.login': {$exists: true}})
  .exec(function (err, users) {
    if(err) return res.send(500, err);
    var twoWeeks = new Date();
    twoWeeks.setDate(twoWeeks.getDate()-14);
    var userInfo = [];
    var count = users.length;

    var getCommits = function(user){
      Commit.find()
            .where('author.login').equals(String(user.github.login))
            .where('date').gt(twoWeeks)
            .exec(function(err, commits){
                var commitList = [];
                commits.forEach(function (c){
                    commitList.push(c.toObject());
                  }
                )
                user.commits = commitList ;
                count--;
                userInfo.push(user);
                if (count === 0){
                  res.status(200).json(userInfo);
                }
            });
    }

    for (var i = 0; i < users.length; i++){
      var u = users[i].stats;
      getCommits(u);
      }
    });
};

/**
* Get list of all users with stats including last commits
* in previous 2 weeks including inactive
* restriction: 'admin'
 */
exports.allStats = function(req, res) {
    // Only return users who have a github login
  ClassYear.getCurrent(function(err, classYear){
    var classYearId = classYear._id;
    User.find({})
    .exec(function (err, users) {
        if(err) return res.status(500).json(err);
        res.status(200).json(users);
    });
  });
};

/**
 * Get list of active users
 */
exports.list = function(req, res) {
  // Only return users who are active and have a github login
  User.find({active: true, 'github.login': {$exists: true}})
  .select('_id name role avatar email github.login')
  .exec(function (err, users) {
    res.status(200).json(users);
  });
};

/**
 * Get list of all past users
 */
exports.past = function(req, res) {
  User.find({active: false})
  .exec(function (err, users) {
    if(err) return res.send(500, err);
      var userInfo = [];

      for (var i = 0; i < users.length; i++){
        userInfo.push(users[i].listInfo);
      }
      res.status(200).json(userInfo);
  });
};

/**
 * Get a list of all the recent RCOS commits for a user
 */
exports.commits = function(req, res) {
  var userId = String(req.params.id);

  Commit.find({ userId: userId}, function(err, commits){
    if (err) return res.send(500, err);
    res.status(200).json(commits);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({ token: token });
  });
};

/**
 * Update an existing user
 */
exports.update = function (req, res, next) {
  if(req.body._id) { delete req.body._id; }

  User.findById(req.params.id, function(err, user){
    if (err) { return handleError(res, err); }
    if(!user) { return res.send(404); }

    var updated = _.merge(user, req.body);
    updated.save(function(err) {
      if (err) { return handleError(res, err); }
      return res.json(200, updated);
    });
  });
}

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId)
  .populate('smallgroup')
  .exec(function (err, user) {
    if (err) {return next(err);}
    if (!user) {return res.send(404);}
    var profile = user.profile;
    return res.json(profile);
  });
};

/**
 * Get a single user
 */
exports.privateProfile = function (req, res, next) {
  var userId = req.params.id;
  User.findById(userId)
  .populate('projects')
  .exec(function (err, user) {
    if (err) {return next(err);}
    if (!user) {return res.send(404);}
    var profile = user.privateProfile;
    return ClassYear.getCurrent(function(err, classYear){
        var classYearId = classYear._id;
        return SmallGroup.findOne({"students":userId, "classYear":classYearId}, function(err, smallgroup){
          if (err) {return next(err);}
          if (smallgroup) {
            var responseObjectSmallgroup = smallgroup.toObject();
            profile.smallgroup = responseObjectSmallgroup;
          }
          // Get how many total attendance days there have been
          var data = user.getTotalDays(classYear, smallgroup);
          profile.totalDates = data.totalDates;
          profile.totalBonusDates = data.totalBonusDates;
          profile.totalSmallDates = data.totalSmallDates;
          profile.totalBonusSmallDates = data.totalBonusSmallDates;

          Attendance.find({classYear:classYearId, user: userId})
          .exec(function (err, attendance) {
              if(err) { return handleError(res, err); }
              profile.attendance = attendance;

              return res.json(profile);
          });
        });
    });
  });
};
/**
 * Get a my smallgroup
 */
exports.smallgroup = function (req, res, next) {
  var userId = req.user.id;
  return ClassYear.getCurrent(function(err, classYear){
      var classYearId = classYear._id;
      var query = SmallGroup.findOne({"students":userId, "classYear":classYearId});
      if (req.user.isMentor){
          query.select('+dayCodes.code')
      }
      return query.exec(function(err, smallgroup){
        if (err) return handleError(res, err);
        if (!smallgroup) return res.json({});
        var responseObject = smallgroup.toObject();
        // If user is not a mentor or not authenticated, don't give dayCode
        if (req.user.isMentor){
          // Mentors should get a day code
          // Generate a day code if one does not already exist
          if (smallgroup.dayCode){
              responseObject.dayCode = smallgroup.dayCode;
          }
          if (smallgroup.bonusDayCode){
              responseObject.bonusDayCode = smallgroup.bonusDayCode;
          }
        }
        res.status(200).json(responseObject);
      });
  });
};


/**
 * Get a single user's smallgroup
 */
exports.userSmallgroup = function (req, res, next) {
  var userId = req.params.id;
  return ClassYear.getCurrent(function(err, classYear){
      var classYearId = classYear._id;
      var query = SmallGroup.findOne({"students":userId, "classYear":classYearId})
      if (req.user.isMentor){
          query.select('+dayCodes.code')
      }
      return query.exec(function(err, smallgroup){
        if (err) return handleError(res, err);
        if (!smallgroup) return res.json({});
        var responseObject = smallgroup.toObject();
        // If user is not a mentor or not authenticated, don't give dayCode
        // Mentors should get a day code
        // Generate a day code if one does not already exist
        if (smallgroup.dayCode){
            responseObject.dayCode = smallgroup.dayCode;
        }
        if (smallgroup.bonusDayCode){
            responseObject.bonusDayCode = smallgroup.bonusDayCode;
        }
        res.status(200).json(responseObject);
      });
  });
};

/**
 * Get a single user's avatar
 */
exports.avatar = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(404);
    return res.json(user.avatar);
  });
};


/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.send(500, err);
    return res.send(204);
  });
  var userId = req.params.id;
  var adminUserId = req.user.id;
  var pass = String(req.body.password);
  var query = {students:{ $in: [userId]}};
  User.findById(adminUserId)
  .select('_id email password provider salt')
  .exec(function (err, user, db) {
    if(user.authenticate(pass)) {
       SmallGroup.findOneAndUpdate(query, {$pull: {students: userId}}, function(err, data){
        if(err) {
         return res.status(500).json({'error' : 'error in deleting address'});
        }
        User.findByIdAndRemove(userId, function(err, user) {
           if(err) return res.send(500, err);
          return res.send(200);
        });
        //res.json(data);
      });
    } else {
      res.send(403);
    }
  });

};

/**
 * Change what role the user is
 * restriction: 'admin'
 */
exports.role = function(req, res) {
    var roles = ['user', 'mentor', 'admin'];
    var userId = req.params.id;
    var newRole = req.body.role;
    // Check that role is valid
    if (roles.indexOf(newRole) === -1){
        res.send(400, {error: "Role does not exist."});
    }
    User.findById(userId, function(err,user){
        if (err){
            res.send(500, err);
        }else{
            if (user.role === newRole) return;
            user.role = newRole;
            user.save(function(err) {
                if (err) return validationError(res, err);
                res.send(200);
            });
        }
    });
}
/**
 * Change a users password
 *
 * This can be done with either the reset token or the user's old
 * password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var token   = String(req.body.token);
  var newPass = String(req.body.newPassword);

  User.findById(userId)
  .select('_id email password provider salt passwordResetToken passwordResetExpiration')
  .exec(function (err, user) {
    if(user.authenticate(oldPass) || user.validResetToken(token)) {
      user.password = newPass;
      user.passwordResetToken = '';
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

/**
 * Deactivates a user
 */
exports.deactivate = function(req,res) {
      var userId = String(req.params.id);
        User.findById(userId, function(err, user){
          if (err) return res.send(500, err);
          user.active = false;
          user.save(function(err){
          if (err) return res.send(500, err);
          res.status(200).json({success: true});
        })
      });
  };

/**
 * Deactivates a user
 */
exports.deactivate = function(req, res, next) {
  var userId = String(req.params.id);

  User.findOne({ '_id': userId}, function(err, user){
    if (err) return res.send(500, err);

    user.active = false;
    user.save(function(err){
    if (err) return res.send(500, err);
      res.status(200).json({success: true});
    })
  });
};

/**
 * Activates a user
 */
exports.activate = function(req, res, next) {
  var userId = String(req.params.id);
  User.findOne({ '_id': userId}, function(err, user){
    if (err) return res.send(500, err);
    user.active = true;
    user.save(function(err){
    if (err) return res.send(500, err);
      res.status(200).json({success: true});
    })
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  })
  .exec(function(err, user) {
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};

/**
 * Add an item to the tech array for a user
 */
exports.addTech = function(req,res){
    var userId = req.params.id;
    var newTech = req.body.tech;
    User.findById(userId, function(err,user){
        if (err){
            res.send(500, err);
        }else{
            if (!user.tech) user.tech = [];
            user.tech.push(newTech);
            user.save(function(err) {
                if (err) return validationError(res, err);
                res.send(200);
            });
        }
    });
};

/**
 * Remove an item from the tech array for a user
 */
exports.removeTech = function(req,res){
    var userId = req.params.id;
    var tech = req.body.tech;
    User.findById(userId, function(err,user){
        if (err){
            res.send(500, err);
        }else{
            if (!user.tech) user.tech = [];
            user.tech.splice(user.tech.indexOf(tech), 1);
            user.save(function(err) {
                if (err) return validationError(res, err);
                res.send(200);
            });
        }
    });
};

/**
 * Set reset token for user and email it the password token will expire after 24 hours.
 */
exports.resetPassword = function(req, res){
    var userEmail = req.body.email;
    User.findOne({
        email: userEmail.toLowerCase()
    }, function (err, user){
        if (err) return res.status(401).json(err);
        if (!user) return res.status(200).json({success: true});

        crypto.randomBytes(12, function(ex, buf) {
            var token = buf.toString('hex');
            user.passwordResetToken = token;

            // Get tomorrow's date
            var tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            user.passwordResetExpiration = tomorrow;

            user.save(function(err){
              if (err) return validationError(res,err);

              var sub = {
                ":name": [user.name],
                "[%address%]": [config.addr + "/login?token=" + user.passwordResetToken],
              }

              var filter = {
                "templates": {
                  "settings": {
                    "enable": 1,
                    "template_id": "2f31a6c8-770e-4da0-a71c-dc71385d549f"
                  }
                }
              }

              // email token to user
              email.sendEmail(user.email, "RCOS.IO Forgot Password", sub, '<br>', filter, function(err, success){
                if (err) return res.status(500).json(err);

                return res.status(200).json(success);
              });
            });

        });

    });

};

/**
 * Add an item to the projects array for the user
 */
exports.addProject = function(req,res){
    var userId = req.params.id;
    var newProject = req.body.project;

    User.findById(userId, function(err,user){
      if (err) { return handleError(res, err); }
      if(!user) { return res.send(404); }

        Projects.findById(newProject, function(err, project) {
          if (err) { return handleError(res, err); }
          if(!project) { return res.send(404); }

          return ClassYear.getCurrent(function(err, classYear){

            if (err) { return handleError(res, err); }
            if(!classYear) { return res.send(404); }

            if (!user.projects) user.projects = [];

            var projectFound = null;
            for (var i = 0; i < user.projects.length; i++){
              if (newProject === user.projects[i]) {
                projectFound == user.projects[i];

                if (!user.projects[i].semesters) user.projects[i].semesters = [];

                var classYearFound = null;

                for(var j = 0; j < user.projects[i].semesters.length; j++) {
                  if (classYear === user.projects[i].semesters[j])  {
                    classYearFound = user.projects[i].semesters[j];
                  }
                }

                if (classYearFound === null) {
                  user.projects[i].semesters.push(classYear);
                }

              }
            }

            if(projectFound == null) {
              var projectToAdd =
              {
                project: newProject._id,
                classYear: [classYear._id]
              }
              user.projects.push(projectToAdd);
            }

            user.save(function(err) {
                if (err) return validationError(res, err);
                res.send(200);
            });

          }
        }
    });
};

/**
 * Remove an item from the tech array for a user
 */
exports.removeProject = function(req,res){
    var userId = req.params.id;
    var project = req.body.project;
    User.findById(userId, function(err,user){
        if (err){
            res.send(500, err);
        }else{
            if (!user.projects) user.projects = [];
            user.projects.splice(user.projects.indexOf(project), 1);
            user.save(function(err) {
                if (err) return validationError(res, err);
                res.send(200);
            });
        }
    });
};
/*
Function that is called by removeUser api call
*/
exports.deleteUser = function(req,res,next){

  var userId = req.user.id;
  var pass = String(req.body.password);
  var query = {students:{ $in: [userId]}};
  User.findById(userId)
  .select('_id email password provider salt passwordResetToken passwordResetExpiration')
  .exec(function (err, user,db) {
    if(user.authenticate(pass)) {
       SmallGroup.findOneAndUpdate(query, {$pull: {students: userId}}, function(err, data){
        if(err) {
         return res.status(500).json({'error' : 'error in deleting address'});
        }
        User.findByIdAndRemove(userId, function(err, user) {
           if(err) return res.send(500, err);
          return res.send(200);
        });
        //res.json(data);
      });
    } else {
      res.send(403);
    }
  });
};
