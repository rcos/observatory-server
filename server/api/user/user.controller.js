'use strict';

const _ = require('lodash');
const User = require('./user.model');
const passport = require('passport');
const config = require('../../config/environment');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const async = require('async');
const email = require("../../components/email");
const Commit = require('../commit/commit.model');
const ClassYear = require('../classyear/classyear.model');
const Attendance = require('../attendance/attendance.model');
const SmallGroup = require('../smallgroup/smallgroup.model');

// Return a standard error
function handleError(res, err) {
  return res.sendStatus(500, err);
}

const validationError = (res, err) => {
  return res.status(422).json(err);
};

/**
* @api {get} /api/users Index
* @apiName commits
* @apiGroup User
* @apiDescription Get list of Users
* @apiPermission public
* @apiSuccess {Collection} root Collection of all active Observatory Users.
* @apiError (500) UnknownException Could not retrieve User collection
*/
exports.index = (req, res) => {
  User.find({}, (err, users) => {
    if (err) return res.send(500, err);
    res.status(200).json(users);
  });
};

/**
 * Get user stats
 */
exports.publicStats = (req, res) => {
  async.parallel([
    // Count active users
      (callback) => {
	  User.count({active:true}, (err, aCount) => {
        if (err) return callback(err);
        callback(null, aCount);
      });
    },
    // Count past users
    (callback) => {
      User.count({active:false}, (err, pCount) => {
        if (err) return callback(err);
        callback(null, pCount);
      });
    },
  ],
  (err, results) => {
    if (err) {
      return res.send(400);
    }

    if (results === null) {
      return res.send(400);
    }

    //results contains [activeProjectCount, pastProjectCount]
    const stats = {};
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
exports.search = (req, res) => {
  if (!req.query.query) return res.send(400, 'No query supplied');
    const query = new RegExp(['^', req.query.query, '$'].join(''), 'i')
    User.findOne({name: query}, (err, user) => {
    if (err) return res.send(500, err);
    if (!user){
      if (req.query.single){
        return res.status(200).json(null);
      } else {
        return res.status(200).json([]);
      }
    }
    if (req.query.single){
      return res.status(200).json(user.profile);
    } else {
      return res.status(200).json([user.profile]);
    }
  });
};

/**
 * Get list of users with stats including last commits
 * in previous 2 weeks
 * restriction: 'admin'
 */
exports.stats = (req, res) => {
  // Only return users who are active and have a github login
  User.find({active: true, 'github.login': {$exists: true}})
	.exec((err, users) => {
    if (err) return res.send(500, err);
    const twoWeeks = new Date();
    twoWeeks.setDate(twoWeeks.getDate()-14);
    const userInfo = [];
    let count = users.length;

	    const getCommits = (user) => {
      Commit.find()
      .where('author.login').equals(String(user.github.login))
      .where('date').gt(twoWeeks)
      .exec((err, commits) => {
        const commitList = [];
        commits.forEach((c) => {
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

    for (let i = 0; i < users.length; i++){
      const u = users[i].stats;
      getCommits(u);
    }
  });
};

/**
 * Get list of all users with stats including last commits
 * in previous 2 weeks including inactive
 * restriction: 'admin'
 */
exports.allStats = (req, res) => {
  // Only return users who have a github login
  ClassYear.getCurrent((err, classYear) => {
    const classYearId = classYear._id;
    User.find({})
    .exec((err, users) => {
      if (err) return res.status(500).json(err);
      res.status(200).json(users);
    });
  });
};

/**
 * Get list of active users
 */
exports.list = (req, res) => {
  // Only return users who are active and have a github login
  User.find({active: true, 'github.login': {$exists: true}})
  .select('_id name role avatar email github.login')
	.exec((err, users) => {
    res.status(200).json(users);
  });
};

/**
 * Get list of all past users
 */
exports.past = (req, res) => {
  User.find({active: false})
  .select('_id name role avatar email github.login')
	.exec((err, users) => {
    if(err) return res.send(500, err);
    res.status(200).json(users);
  });
};

/**
 * Get a list of all the recent RCOS commits for a user
 */
exports.commits = (req, res) => {
  const userId = String(req.params.id);

  Commit.find({ userId: userId}, (err, commits) => {
    if (err) return res.send(500, err);
    res.status(200).json(commits);
  });
};

/**
 * Creates a new user
 */
exports.create = (req, res, next) => {
  const newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save((err, user) => {
    if (err) return validationError(res, err);
    const token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json(201, { token: token });
  });
};

/**
 * Update an existing user
 */
exports.update = (req, res, next) => {
  if(req.body._id) { delete req.body._id; }

    User.findById(req.params.id, (err, user) => {
    if (err) { return handleError(res, err); }
    if (!user) { return res.send(404); }

    const updated = _.merge(user, req.body);
    updated.save((err) => {
      if (err) { return handleError(res, err); }
      return res.json(200, updated);
    });
  });
}

/**
 * Get a single user
 */
exports.show = (req, res, next) => {
  const userId = req.params.id;

  User.findById(userId)
  .populate('smallgroup')
  .exec((err, user) => {
    if (err) {return next(err);}
    if (!user) {return res.send(404);}
    const profile = user.profile;
    return res.json(profile);
  });
};

/**
 * Get a single user
 */
exports.privateProfile = (req, res, next) => {
  const userId = req.params.id;
  User.findById(userId)
  .populate('projects')
  .populate('favoriteProjects')
  .exec((err, user) => {
    if (err) {return next(err);}
    if (!user) {return res.send(404);}
    const profile = user.privateProfile;
      return ClassYear.getCurrent((err, classYear) => {
      const classYearId = classYear._id;
      return SmallGroup.findOne({'students':userId, 'fclassYear':classYearId}, (err, smallgroup) => {
        if (err) {return next(err);}
        if (smallgroup) {
          const responseObjectSmallgroup = smallgroup.toObject();
          profile.smallgroup = responseObjectSmallgroup;
        }
        // Get how many total attendance days there have been
        const data = user.getTotalDays(classYear, smallgroup);
        profile.totalDates = data.totalDates;
        profile.totalBonusDates = data.totalBonusDates;
        profile.totalSmallDates = data.totalSmallDates;
        profile.totalBonusSmallDates = data.totalBonusSmallDates;

        Attendance.find({classYear:classYearId, user: userId})
        .exec((err, attendance) => {
          if (err) { return handleError(res, err); }
          profile.attendance = attendance;

          return res.json(profile);
        });
      });
    });
  });
};

/**
 * Get a user's favorite projects
 */
exports.favoriteProjects = (req, res, next) => {
  const userId = req.params.id;
  User.findById(userId)
  .populate('favoriteProjects')
  .exec((err, user) => {
    if (err) { return next(err);}
    if (!user) { return res.send(404);}

    return res.json(user.favoriteProjects);
  });
};

/**
 * Get a my smallgroup
 */
exports.smallgroup = (req, res, next) => {
  const userId = req.user.id;
  return ClassYear.getCurrent((err, classYear) => {
    const classYearId = classYear._id;
    const query = SmallGroup.findOne({'students':userId, 'classYear':classYearId});
    if (req.user.isMentor) {
      query.select('+dayCodes.code')
    }
    return query.exec((err, smallgroup) => {
      if (err) return handleError(res, err);
      if (!smallgroup) return res.json({});
      const responseObject = smallgroup.toObject();
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
exports.userSmallgroup = (req, res, next) => {
  const userId = req.params.id;
  return ClassYear.getCurrent((err, classYear) => {
    const classYearId = classYear._id;
    const query = SmallGroup.findOne({'students':userId, 'classYear':classYearId})
    if (req.user.isMentor){
      query.select('+dayCodes.code')
    }
    return query.exec((err, smallgroup) => {
      if (err) return handleError(res, err);
      if (!smallgroup) return res.json({});
      var responseObject = smallgroup.toObject();
      // If user is not a mentor or not authenticated, don't give dayCode
      // Mentors should get a day code
      // Generate a day code if one does not already exist
      if (smallgroup.dayCode){
        responseObject.dayCode = smallgroup.dayCode;
      }
      if (smallgroup.bonusDayCode) {
        responseObject.bonusDayCode = smallgroup.bonusDayCode;
      }
      res.status(200).json(responseObject);
    });
  });
};

/**
 * Get a single user's avatar
 */
exports.avatar = (req, res, next) => {
  const userId = req.params.id;

  User.findById(userId, (err, user) => {
    if (err) return next(err);
    if (!user) return res.send(404);
    return res.json(user.avatar);
  });
};


/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = (req, res) => {
  User.findByIdAndRemove(req.params.id, (err, user) => {
    if (err) return res.send(500, err);
    return res.send(204);
  });
  const userId = req.params.id;
  const adminUserId = req.user.id;
  const pass = String(req.body.password);
  const query = {students:{ $in: [userId]}};
  User.findById(adminUserId)
  .select('_id email password provider salt')
  .exec((err, user, db) => {
    if(user.authenticate(pass)) {
      SmallGroup.findOneAndUpdate(query, {$pull: {students: userId}}, (err, data) => {
        if (err) {
          return res.status(500).json({'error' : 'error in deleting address'});
        }
        User.findByIdAndRemove(userId, (err, user) => {
          if (err) return res.send(500, err);
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
exports.role = (req, res) => {
  const roles = ['user', 'mentor', 'admin'];
  const userId = req.params.id;
  const newRole = req.body.role;
  // Check that role is valid
  if (roles.indexOf(newRole) === -1){
    res.send(400, {error: "Role does not exist."});
  }
  User.findById(userId, (err,user) => {
    if (err) {
      res.send(500, err);
    } else {
      if (user.role === newRole) return;
      user.role = newRole;
      user.save((err) => {
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
exports.changePassword = (req, res, next) => {
  const userId = req.user._id;
  const oldPass = String(req.body.oldPassword);
  const token   = String(req.body.token);
  const newPass = String(req.body.newPassword);

  User.findById(userId)
  .select('_id email password provider salt passwordResetToken passwordResetExpiration')
  .exec((err, user) => {
    if(user.authenticate(oldPass) || user.validResetToken(token)) {
      user.password = newPass;
      user.passwordResetToken = '';
      user.save((err) => {
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
exports.deactivate = (req,res) => {
  const userId = String(req.params.id);
  User.findById(userId, (err, user) => {
    if (err) return res.send(500, err);
    user.active = false;
    user.save((err) => {
      if (err) return res.send(500, err);
      res.status(200).json({success: true});
    })
  });
};

/**
 * Deactivates a user
 */
exports.deactivate = (req, res, next) => {
  const userId = String(req.params.id);

  User.findOne({ '_id': userId}, (err, user) => {
    if (err) return res.send(500, err);

    user.active = false;
    user.save((err) => {
      if (err) return res.send(500, err);
      res.status(200).json({success: true});
    })
  });
};

/**
 * Activates a user
 */
exports.activate = (req, res, next) => {
  let userId = String(req.params.id);
    User.findOne({ '_id': userId}, (err, user) => {
    if (err) return res.send(500, err);
    user.active = true;
    user.save((err) => {
      if (err) return res.send(500, err);
      res.status(200).json({success: true});
    })
  });
};

/**
 * Get my info
 */
exports.me = (req, res, next) => {
  const userId = req.user._id;
  User.findOne({
    _id: userId
  })
  .exec((err, user) => {
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = (req, res, next) => {
  res.redirect('/');
};

/**
 * Add an item to the tech array for a user
 */
exports.addTech = (req,res) => {
  const userId = req.params.id;
  const newTech = req.body.tech;
  User.findById(userId, (err,user) => {
    if (err) {
      res.send(500, err);
    } else {
      if (!user.tech) user.tech = [];
      user.tech.push(newTech);
      user.save((err) => {
        if (err) return validationError(res, err);
        res.send(200);
      });
    }
  });
};

/**
 * Remove an item from the tech array for a user
 */
exports.removeTech = (req,res) => {
  const userId = req.params.id;
  const tech = req.body.tech;
  User.findById(userId, (err,user) => {
    if (err){
      res.send(500, err);
    } else {
      if (!user.tech) user.tech = [];
      user.tech.splice(user.tech.indexOf(tech), 1);
      user.save((err) => {
        if (err) return validationError(res, err);
        res.send(200);
      });
    }
  });
};

/**
 * Set reset token for user and email it the password token will expire after 24 hours.
 */
exports.resetPassword = (req, res) => {
  const userEmail = req.body.email;
  User.findOne({
    email: userEmail.toLowerCase()
  }, (err, user) => {
    if (err) return res.status(401).json(err);
    if (!user) return res.status(200).json({success: true});

    crypto.randomBytes(12, (ex, buf) => {
      const token = buf.toString('hex');
      user.passwordResetToken = token;

      // Get tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      user.passwordResetExpiration = tomorrow;

      user.save((err) => {
        if (err) return validationError(res,err);

        const sub = {
          ':name': [user.name],
          '[%address%]': [config.addr + '/login?token=' + user.passwordResetToken],
        }

        const filter = {
          'templates': {
            'settings': {
              'enable': 1,
              'template_id': '2f31a6c8-770e-4da0-a71c-dc71385d549f'
            }
          }
        }

        // email token to user
        email.sendEmail(user.email, 'RCOS.IO Forgot Password', sub, '<br>', filter, (err, success) => {
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
exports.addProject = (req,res) => {
  const userId = req.params.id;
  const newProject = req.body.project;
  User.findById(userId, (err,user) => {
    if (err) {
      res.send(500, err);
    } else {
      if (!user.projects) user.projects = [];
      if (user.projects.indexOf(newProject) !== -1) return;
      user.projects.push(newProject);
      user.save((err) => {
        if (err) return validationError(res, err);
        res.send(200);
      });
    }
  });
};

/**
 * Add an item to the favorite projects array for the user
 */
exports.addFavorite = (req,res) => {
  const userId = req.params.id;
  const newFavorite = req.params.project;
  User.findById(userId, (err,user) => {
    if (err){
      res.send(500, err);
    } else {
      if (!user.favoriteProjects) user.favoriteProjects = [];
      if (user.favoriteProjects.indexOf(newFavorite) !== -1) return;
      user.favoriteProjects.push(newFavorite);
      user.save((err) => {
        if (err) return validationError(res, err);
        res.send(200);
      });
    }
  });
};

/**
 * Remove an item from the tech array for a user
 */
exports.removeProject = (req,res) => {
  const userId = req.params.id;
  const project = req.body.project;
  User.findById(userId, (err,user) => {
    if (err) {
      res.send(500, err);
    } else {
      if (!user.projects) user.projects = [];
      user.projects.splice(user.projects.indexOf(project), 1);
      user.save((err) => {
        if (err) return validationError(res, err);
        res.send(200);
      });
    }
  });
};
/**
 * Remove an item from the favorite projects array for a user
 */
exports.removeFavorite = (req,res) => {
  const userId = req.params.id;
  const project = req.params.project;
  User.findById(userId, (err,user) => {
    if (err) {
      res.send(500, err);
    } else {
      if (!user.favoriteProjects) user.favoriteProjects = [];
      user.favoriteProjects.splice(user.favoriteProjects.indexOf(project), 1);
      user.save((err) => {
        if (err) return validationError(res, err);
        res.send(200);
      });
    }
  });
};
/*
   Function that is called by removeUser api call
   */
exports.deleteUser = (req,res,next) => {

  const userId = req.user.id;
  const pass = String(req.body.password);
  const query = {students:{ $in: [userId]}};
  User.findById(userId)
  .select('_id email password provider salt passwordResetToken passwordResetExpiration')
  .exec((err, user,db) => {
    if(user.authenticate(pass)) {
      SmallGroup.findOneAndUpdate(query, {$pull: {students: userId}}, (err, data) => {
        if (err) {
          return res.status(500).json({'error' : 'error in deleting address'});
        }
        User.findByIdAndRemove(userId, (err, user) => {
          if (err) return res.send(500, err);
          return res.send(200);
        });
        //res.json(data);
      });
    } else {
      res.send(403);
    }
  });
};
