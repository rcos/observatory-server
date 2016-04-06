'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var email = require("../../components/email");
var Commit = require('../commit/commit.model');
var ClassYear = require('../classyear/classyear.model');
var Attendance = require('../attendance/attendance.model');
var SmallGroup = require('../smallgroup/smallgroup.model');

function isoDateToTime(isoDate){
  var date = new Date(isoDate);
  date.setHours(0,0,0,0);
  return date.getTime();
}



var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword -passwordResetToken -passwordResetExpiration', function (err, users) {
    if(err) return res.send(500, err);
    res.json(200, users);
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
    User.findOne({name: query},  '-salt -hashedPassword -passwordResetToken -passwordResetExpiration', function(err, user){
        if (err) return res.send(500, err);
        if (!user){
            if (req.query.single){
                return res.send(200, null);
            }else{
                return res.send(200, []);
            }
        }
        if (req.query.single){
            return res.send(200, user.profile);
        }else{
            return res.send(200, [user.profile]);
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
  User.find({active: true, 'github.login': {$exists: true}}, '-salt -hashedPassword -passwordResetToken -passwordResetExpiration' ).exec(function (err, users) {
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
                  res.json(200, userInfo);
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
    User.find({'github.login': {$exists: true}}, '-salt -hashedPassword -passwordResetToken -passwordResetExpiration' ).exec(function (err, users) {
        if(err) return res.send(500, err);
        var twoWeeks = new Date();
        twoWeeks.setDate(twoWeeks.getDate()-14);
        var userInfo = [];
        var count = users.length;

        var getCommits = function(u){
            var user = u.privateProfile;
            ClassYear.getCurrent(function(err, classYear){
                var classYearId = classYear._id;
                Attendance.find({classYear:classYearId, user: u._id})
                .exec(function (err, attendance) {
                    if(err) { return handleError(res, err); }
                    user.attendance = attendance;
                    Commit.find()
                    .where('author.login').equals(String(user.githubProfile))
                    .where('date').gt(twoWeeks)
                    .lean()
                    .exec(function(err, commits){
                        if(err){
                            user.commits = [] ;
                            count--;
                            userInfo.push(user);
                            if (count === 0){
                                res.json(200, userInfo);
                            }
                        }
                        else{
                            var commitList = [];
                            commits.forEach(function (c){
                                commitList.push(c.toObject());
                            });
                            user.commits = commitList;
                            count--;
                            userInfo.push(user);
                            if (count === 0){
                                res.json(200, userInfo);
                            }
                        }
                    });
                });
            });
        };
        for (var i = 0; i < users.length; i++){
            var u = users[i];
            getCommits(u);
        }
    });
};

/**
 * Get list of active users
 */
exports.list = function(req, res) {
  // Only return users who are active and have a github login
  User.find({active: true, 'github.login': {$exists: true}}, '-salt -hashedPassword -passwordResetToken -passwordResetExpiration', function (err, users) {
    if(err) return res.send(500, err);
    var userInfo = [];

    for (var i = 0; i < users.length; i++){
      userInfo.push(users[i].listInfo);
    }
    res.json(200, userInfo);
  });
};

/**
 * Get list of all past users
 */
exports.past = function(req, res) {
  User.find({active: false}, '-salt -hashedPassword -passwordResetToken -passwordResetExpiration', function (err, users) {
    if(err) return res.send(500, err);
      var userInfo = [];

      for (var i = 0; i < users.length; i++){
        userInfo.push(users[i].listInfo);
      }
      res.json(200, userInfo);
  });
};

/**
 * Get a list of all the recent RCOS commits for a user
 */
exports.commits = function(req, res) {
  var userId = String(req.params.id);

  Commit.find({ userId: userId}, function(err, commits){
    if (err) return res.send(500, err);
    res.json(200, commits);
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
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId)
  .select( '-salt -hashedPassword -passwordResetToken -passwordResetExpiration')
  .populate('smallgroup')
  .exec(function (err, user) {
    if (err) {return next(err);}
    if (!user) {return res.send(404);}
    var profile = user.profile;
    ClassYear.getCurrent(function (err, classYear) {
        return res.json(profile);
    });
  });
};

/**
 * Get a single user
 */
exports.privateProfile = function (req, res, next) {
  var userId = req.params.id;
  User.findById(userId)
  .select( '-salt -hashedPassword -passwordResetToken -passwordResetExpiration')
  .populate('smallgroup')
  .populate('projects')
  .exec(function (err, user) {
    if (err) {return next(err);}
    if (!user) {return res.send(404);}
    var profile = user.privateProfile;
    ClassYear.getCurrent(function(err, classYear){
        var classYearId = classYear._id;

        // Get how many total attendance days there have been
        var data = user.getTotalDays(classYear);
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
};



/**
 * Get a single user's avatar
 */
exports.avatar = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId,  '-salt -hashedPassword -passwordResetToken -passwordResetExpiration',function (err, user) {
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
    User.findById(userId,  '-salt -hashedPassword -passwordResetToken -passwordResetExpiration',function(err,user){
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

  User.findById(userId,function (err, user) {
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
          res.json(200, {success: true});
        })
      });
  };

/**
 * Changes a user's bio
 */
exports.changeBio = function(req,res){
    var userId = req.user._id;
    var newBio = String(req.body.bio);
    User.findById(userId,  '-salt -hashedPassword -passwordResetToken -passwordResetExpiration',function(err,user){
        user.bio = newBio;
        user.save(function(err){
            if (err) return validationError(res,err);
            return res.json({bio:user.bio});

        })

    });
};

/**
 * Changes a user's Github profile
 */
 exports.changeGithub = function(req,res){
   var userId = req.user._id;
   var newGithubProfile = String(req.body.github);
   User.findById(userId,  '-salt -hashedPassword -passwordResetToken -passwordResetExpiration',function(err,user){
     user.github.login = newGithubProfile;
     user.save(function(err){
        if (err) return validationError(res,err);
        res.json(200, {githubProfile:user.github.login});
     })
   });
 };

/**
 * Deactivates a user
 */
exports.deactivate = function(req, res, next) {
  var userId = String(req.params.id);

  User.findOne({ '_id': userId},  '-salt -hashedPassword -passwordResetToken -passwordResetExpiration',function(err, user){
    if (err) return res.send(500, err);

    user.active = false;
    user.save(function(err){
    if (err) return res.send(500, err);
      res.json(200, {success: true});
    })
  });
};

/**
 * Activates a user
 */
exports.activate = function(req, res, next) {
  var userId = String(req.params.id);
  User.findOne({ '_id': userId},  '-salt -hashedPassword -passwordResetToken -passwordResetExpiration',function(err, user){
    if (err) return res.send(500, err);
    user.active = true;
    user.save(function(err){
    if (err) return res.send(500, err);
      res.json(200, {success: true});
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
}, '-salt -hashedPassword -passwordResetToken -passwordResetExpiration', function(err, user) { // don't ever give out the password or salt
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
    User.findById(userId,  '-salt -hashedPassword -passwordResetToken -passwordResetExpiration', function(err,user){
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
    User.findById(userId,  '-salt -hashedPassword -passwordResetToken -passwordResetExpiration', function(err,user){
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
    },  '-salt -hashedPassword -passwordResetToken -passwordResetExpiration', function (err, user){
        if (err) return res.json(401, err);
        if (!user) return res.send(200);

        crypto.randomBytes(12, function(ex, buf) {
            var token = buf.toString('hex');
            user.passwordResetToken = token;

            // Get tomorrow's date
            var tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            user.passwordResetExpiration = tomorrow;

            user.save(function(err){
                if (err) return validationError(res,err);
                res.send(200);

                // email token to user
                email.send(userEmail,
                    "Observatory3 password reset",
                    "Please go to the following url to reset your password\n\n\
                    " + config.addr + "/login?token=" + user.passwordResetToken + "\n\n\
                    The token will expire after 24 hours\n\n\
                    If you did not initiate this action, please ignore this email");
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
    User.findById(userId,  '-salt -hashedPassword -passwordResetToken -passwordResetExpiration', function(err,user){
        if (err){
            res.send(500, err);
        }else{
            if (!user.projects) user.projects = [];
            if (user.projects.indexOf(newProject) !== -1) return;
            user.projects.push(newProject);
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
exports.removeProject = function(req,res){
    var userId = req.params.id;
    var project = req.body.project;
    User.findById(userId,  '-salt -hashedPassword -passwordResetToken -passwordResetExpiration', function(err,user){
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
  var userId = req.params.id;
  var pass = String(req.body.oldPassword);
  var query = {students:{ $in: [userId]}};
  User.findById(userId, function (err, user,db) {
    if(user.authenticate(pass)) {
       SmallGroup.findOneAndUpdate(query, {$pull: {students: userId}}, function(err, data){
        if(err) {
         return res.status(500).json({'error' : 'error in deleting address'});
        }
        User.findByIdAndRemove(req.params.id, function(err, user) {
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
