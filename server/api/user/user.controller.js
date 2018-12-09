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
* @apiName index
* @apiGroup User
* @apiDescription Get list of Users
* @apiPermission public
* @apiSuccess {Collection} root Collection of all active Observatory Users.
* @apiError (500) UnknownException Could not retrieve User collection
*/
exports.index = async (req, res) => {
  const users = await User.find({}).catch((err) => res.send(500, err))
  res.status(200).json(users)
};

/**
* @api {get} /api/users Search
* @apiName search
* @apiGroup User
* @apiDescription Gets user or list of users that match a supplied query
* @apiPermission public
* @apiSuccess {Collection} root Collection of Observatory User(s).
* @apiError (500) UnknownException Could not retrieve User collection
*/
// TODO Make this work with fuzzy queries, multiple results etc.
exports.search = async (req, res) => {
  if (!req.query.query) return res.send(400, 'No query supplied');
  const query = new RegExp(['^', req.query.query, '$'].join(''), 'i')
  const user = await User.findOne({ name: query }).catch((err) => res.send(500, err))

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
};

/**
* @api {get} /api/users AllStats
* @apiName allStats
* @apiGroup User
* @apiDescription Gets list of all users with stats including last commits in previous two weeks (including inactive)
* @apiPermission admin
* @apiSuccess {Collection} root Collection of Observatory User(s).
* @apiError (500) UnknownException Could not retrieve User collection
*/
exports.allStats = async (req, res) => {
  // Only return users who have a github login
  const classYear = await ClassYear.getCurrent().catch((err) => handleError(err))
  //const classYearId = classYear._id;
  let users = await User.find({}).catch((err) => res.status(500).json(err))
  res.status(200).json(users);
};


/**
* @api {get} /api/users List
* @apiName list
* @apiGroup User
* @apiDescription Gets list of all active users (with github login)
* @apiPermission public
* @apiSuccess {Collection} root Collection of Observatory User(s).
* @apiError (500) UnknownException Could not retrieve User collection
*/
exports.list = async (req, res) => {
  // Only return users who are active and have a github login
  let users = await User.find({ active: true, 'github.login': { $exists: true }})
  .select('_id name role avatar email tech github.login')
  .catch((err) => res.status(500).json({ err }).end())

  res.status(200).json(users).end()
}

/**
* @api {get} /api/users Past
* @apiName past
* @apiGroup User
* @apiDescription Gets list of all past users (with github login)
* @apiPermission public
* @apiSuccess {Collection} root Collection of Observatory User(s).
* @apiError (500) UnknownException Could not retrieve User collection
*/
exports.past = async (req, res) => {
  let users = await User.find({ active: false })
  .select('_id name role avatar email github.login')
  .catch((err) => res.send(500, err))
  
  res.status(200).json(users);
};

/**
* @api {get} /api/users Create
* @apiName create
* @apiGroup User
* @apiDescription Creates a new user
* @apiPermission public
* @apiSuccess {Collection} root Create a new user
* @apiError (500) UnknownException Could not create a new user
*/
exports.create = (req, res, next) => {
  const newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save()
  .then((user) => {
    const token = jwt.sign({ _id: user._id }, config.secrets.session, { expiresIn : 60*60*5 });
    res.status(201).json({ token: token });
  })
  .catch((err) => validationError(res, err))
};

/**
* @api {get} /api/users Update
* @apiName update
* @apiGroup User
* @apiDescription Updates user
* @apiPermission private
* @apiSuccess {Collection} root Updates a user
* @apiError (500) UnknownException Could not update a user
*/
exports.update = async (req, res, next) => {
  if (req.body._id) { delete req.body._id; }

  let user = await User.findById(req.params.id).catch((err) => handleError(res, err))
  
  if (!user) { return res.send(404); }

  const updated = _.merge(user, req.body);
  await updated.save().catch((err) => handleError(res, err))
  return res.status(200).json(updated);
}

/**
* @api {get} /api/users Show
* @apiName show
* @apiGroup User
* @apiDescription Get a single user
* @apiPermission public
* @apiSuccess {Collection} root Get a single user
* @apiError (500) UnknownException Could not get a user
*/
exports.show = async (req, res, next) => {
  const userId = req.params.id;

  let user = await User.findById(userId)
  .populate('smallgroup')
  .catch((err) => next(err))

  if (!user) { return res.send(404);}
  const profile = user.profile;
  return res.json(profile);
};

/**
 * Get a single user
 */

/**
* @api {get} /api/users PrivateProfile
* @apiName privateProfile
* @apiGroup User
* @apiDescription Get a single private profile
* @apiPermission private
* @apiSuccess {Collection} root Get a private profile
* @apiError (500) UnknownException Could not get a private profile
*/
exports.privateProfile = async (req, res, next) => {
  const userId = req.params.id;
  const user = await User.findById(userId)
  .populate('projects')
  .catch((err) => handleError(err))
  
  if (err) { return next(err); }
  if (!user) { return res.send(404); }
  const profile = user.privateProfile;
  const classYear = await ClassYear.getCurrent().catch((err) => handleError(err))
  const classYearId = classYear._id;
  let smallgroup = await SmallGroup.findOne({ 'students': userId, 'fclassYear': classYearId }).catch((err) => next(err))
  
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

  let attendance = await Attendance.find({ classYear:classYearId, user: userId }).catch((err) => handleError(res, err))
  profile.attendance = attendance;
  return res.json(profile);
};


/**
* @api {get} /api/users Smallgroup
* @apiName smallgroup
* @apiGroup User
* @apiDescription Get a user's smallgroup
* @apiPermission public
* @apiSuccess {Collection} root Get a user's smallgroup
* @apiError (500) UnknownException Could not get a user's smallgroup
*/
exports.smallgroup = async (req, res, next) => {
  const userId = req.user.id;
  const classYear = await ClassYear.getCurrent().catch((err) => handleError(err))
  const classYearId = classYear._id;
  const query = SmallGroup.findOne({ 'students': userId, 'classYear': classYearId });
  if (req.user.isMentor) {
    query.select('+dayCodes.code')
  }

  let smallgroup = await query.exec().catch((err) => handleError(res, err));
  
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
};


/**
* @api {get} /api/users UserSmallgroup
* @apiName userSmallgroup
* @apiGroup User
* @apiDescription Get a single user's smallgroup
* @apiPermission public
* @apiSuccess {Collection} root Get a single user's smallgroup
* @apiError (500) UnknownException Could not get a single user's smallgroup
*/
exports.userSmallgroup = async (req, res, next) => {
  const userId = req.params.id;
  const classYear = await ClassYear.getCurrent().catch((err) => handleError(err))
  const classYearId = classYear._id;
  const query = SmallGroup.findOne({ 'students': userId, 'classYear': classYearId })
  if (req.user.isMentor){
    query.select('+dayCodes.code')
  }

  let smallgroup = await query.exec().catch((err) => handleError(res, err))
    
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
};

/**
* @api {get} /api/users Avatar
* @apiName avatar
* @apiGroup User
* @apiDescription Get a user's avatar
* @apiPermission admin
* @apiSuccess {Collection} root Get a user's avatar
* @apiError (500) UnknownException Could not get a user's avatar
*/
exports.avatar = async (req, res, next) => { 
  const userId = req.params.id;

  let user = await User.findById(userId).catch((err) => next(err))
  if (!user) return res.send(404);
  return res.json(user.avatar);
};

/**
* @api {get} /api/users Destroy
* @apiName destroy
* @apiGroup User
* @apiDescription Deletes a user
* @apiPermission public
* @apiSuccess {Collection} root Deletes a user
* @apiError (500) UnknownException Could not delete a user
*/
exports.destroy = async (req, res) => { 
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
      res.status(403).json({forbidden: true});
    }
  });

};

/**
* @api {get} /api/users Role
* @apiName role
* @apiGroup User
* @apiDescription Change what role the user is
* @apiPermission admin
* @apiSuccess {Collection} root Changes the role of a user
* @apiError (500) UnknownException Could not change the role of the user
*/
exports.role = async (req, res) => {
  const roles = ['user', 'mentor', 'admin'];
  const userId = req.params.id;
  const newRole = req.body.role;
  // Check that role is valid
  if (roles.indexOf(newRole) === -1){
    res.send(400, {error: "Role does not exist."});
  }
  let user = await User.findById(userId).catch((err) => res.send(500, err))
  if (user.role === newRole) return;
  user.role = newRole;
  await user.save((err) => validationError(res, err))
  res.status(200).json({ success: true });
}

/**
* @api {get} /api/users ChangePassword
* @apiName changePassword
* @apiGroup User
* @apiDescription Changes the password of a user, either with reset token or the user's old password
* @apiPermission public
* @apiSuccess {Collection} root Changes the password of a user
* @apiError (500) UnknownException Could not change the password of a user
*/
exports.changePassword = async (req, res, next) => {
  const userId = req.user._id;
  const oldPass = String(req.body.oldPassword);
  const token   = String(req.body.token);
  const newPass = String(req.body.newPassword);

  let user = await User.findById(userId)
  .select('_id email password provider salt passwordResetToken passwordResetExpiration')
  .exec()

  if (user.authenticate(oldPass) || user.validResetToken(token)) {
    user.password = newPass;
    user.passwordResetToken = '';
    await user.save().catch((err) => validationError(res, err))
    res.status(200).json({ success: true });
  } else {
    res.status(403).json({ forbidden: true });
  }
};

/**
* @api {get} /api/users Deactivate
* @apiName deactivate
* @apiGroup User
* @apiDescription Deactivates a user
* @apiPermission public
* @apiSuccess {Collection} root Deactivates a user
* @apiError (500) UnknownException Could not deactivate a user
*/
exports.deactivate = async (req, res) => {
  const userId = String(req.params.id);
  let user = await User.findById(userId).catch((err) => res.send(500, err))
  
  user.active = false;
  await user.save().catch((err) => res.send(500, err))
  res.status(200).json({ success: true });
};

/**
* @api {get} /api/users Deactivate
* @apiName deactivate
* @apiGroup User
* @apiDescription Deactivates a user
* @apiPermission public
* @apiSuccess {Collection} root Deactivates a user
* @apiError (500) UnknownException Could not deactivate a user
*/
exports.deactivate = async (req, res, next) => {
  const userId = String(req.params.id);

  let user = await User.findOne({ '_id': userId }).catch((err) => res.send(500, err))
  
  user.active = false;
  user.save().catch((err) => res.send(500, err));
  res.status(200).json({success: true});
};


/**
* @api {get} /api/users Activate
* @apiName Activate
* @apiGroup User
* @apiDescription Activates a user
* @apiPermission public
* @apiSuccess {Collection} root Activates a user
* @apiError (500) UnknownException Could not activate a user
*/
exports.activate = async (req, res, next) => {
  let userId = String(req.params.id);
  let user = await User.findOne({ '_id': userId }).catch((err) => res.send(500, err))
  user.active = true;
  await user.save().catch((err) => res.send(500, err))
  res.status(200).json({ success: true });
};

/**
* @api {get} /api/users Me
* @apiName me
* @apiGroup User
* @apiDescription Get my info
* @apiPermission public
* @apiSuccess {Collection} root Get my info
* @apiError (500) UnknownException Could not get my info
*/
exports.me = async (req, res, next) => {
  const userId = req.user._id;
  let user = await User.findOne({
    _id: userId
  })
  .exec()
  .catch((err) => next(err))

  if (!user) return res.json(401);
  res.json(user);
};


/**
* @api {get} /api/users AuthCallback
* @apiName authCallback
* @apiGroup User
* @apiDescription Authenticates callback
* @apiPermission public
* @apiSuccess {Collection} root Authenticates callback
* @apiError (500) UnknownException Could not authenticate callback
*/
exports.authCallback = (req, res, next) => {
  res.redirect('/');
};


/**
* @api {get} /api/users AddTech
* @apiName addTech
* @apiGroup User
* @apiDescription Add an item to the tech array for a user
* @apiPermission public
* @apiSuccess {Collection} root Item added to tech array for a user
* @apiError (500) UnknownException Could not add item to tech array for a user
*/
exports.addTech = async (req,res) => {
  const userId = req.params.id;
  const newTech = req.body.tech;
  let user = await User.findById(userId).catch((err) => res.send(500, err))
  if (!user.tech) user.tech = [];
  user.tech.push(newTech);
  await user.save().catch((err) => validationError(res, err))
  res.status(200).json({success: true});
};


/**
* @api {get} /api/users RemoveTech
* @apiName removeTech
* @apiGroup User
* @apiDescription Remove an item to the tech array for a user
* @apiPermission public
* @apiSuccess {Collection} root Item removed to tech array for a user
* @apiError (500) UnknownException Could not removed item to tech array for a user
*/
exports.removeTech = async (req,res) => {
  const userId = req.params.id;
  const tech = req.body.tech;
  let user = await User.findById(userId).catch((err) => res.send(500, err))
  if (!user.tech) user.tech = [];
  user.tech.splice(user.tech.indexOf(tech), 1);
  await user.save().catch((err) => validationError(res, err))
  res.status(200).json({success: true});
};

/**
* @api {get} /api/users ResetPassword
* @apiName resetPassword
* @apiGroup User
* @apiDescription Set reset token for user and email it the password token will expire after 24 hours.
* @apiPermission public
* @apiSuccess {Collection} root Reset token for user
* @apiError (500) UnknownException Could not reset token for user
*/
exports.resetPassword = async (req, res) => {
  const userEmail = req.body.email;
  let user = await User.findOne({
    email: userEmail.toLowerCase()
  }).catch((err) => res.status(401).json(err))

  if (!user) return res.status(200).json({ success: true });

  let buf = await crypto.randomBytes(12)

  const token = buf.toString('hex');
  user.passwordResetToken = token;

  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  user.passwordResetExpiration = tomorrow;

  await user.save().catch((err) => validationError(res,err));

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
  let success = email.sendEmail(user.email, 'RCOS.IO Forgot Password', sub, '<br>', filter)
  .catch((err) => res.status(500).json(err))

  return res.status(200).json(success);
};

/**
* @api {get} /api/users AddProject
* @apiName addProject
* @apiGroup User
* @apiDescription Add an item to the projects array for the user
* @apiPermission public
* @apiSuccess {Collection} root Adds an item to the projects array for the user
* @apiError (500) UnknownException Could not add an item to the projects array for the user
*/
exports.addProject = async (req,res) => {
  const userId = req.params.id;
  const newProject = req.body.project;
  let user = await User.findById(userId).catch((err) => res.send(500, err))
  if (!user.projects) user.projects = [];
  if (user.projects.indexOf(newProject) !== -1) return;
  user.projects.push(newProject);
  await user.save().catch((err) => validationError(res, err))
  res.status(200).json({ success: true });
};


/**
* @api {get} /api/users RemoveProject
* @apiName removeProject
* @apiGroup User
* @apiDescription Remove an item from the tech array for a user
* @apiPermission public
* @apiSuccess {Collection} root Remove an item from the tech array for a user
* @apiError (500) UnknownException Could not remove an item from the tech array for a user
*/
exports.removeProject = async (req,res) => {
  const userId = req.params.id;
  const project = req.body.project;
  let user = await User.findById(userId).catch((err) => res.send(500, err))
  if (!user.projects) user.projects = [];
  user.projects.splice(user.projects.indexOf(project), 1);
  await user.save().catch((err) => validationError(res, err))
  res.status(200).json({success: true});
};


/**
* @api {get} /api/users DeleteUser
* @apiName deleteUser
* @apiGroup User
* @apiDescription Function that is called by removeUser api call to delete user
* @apiPermission public
* @apiSuccess {Collection} root Deletes user
* @apiError (500) UnknownException Could not delete user
*/
exports.deleteUser = async (req,res,next) => {
  const userId = req.user.id;
  const pass = String(req.body.password);
  const query = { students: { $in: [userId] } };
  let user = await User.findById(userId)
  .select('_id email password provider salt passwordResetToken passwordResetExpiration')
  .exec()

  if (user.authenticate(pass)) {
    let data = await SmallGroup.findOneAndUpdate(query, {$pull: {students: userId}})
    .catch((err) => res.status(500).json({ 'error' : 'error in deleting address' }))
    
    user = await User.findByIdAndRemove(userId).catch((err) => res.send(500, err))
    return res.send(200);
    //res.json(data);
  } else {
    res.status(403).json({ forbidden: true });
  }

};
