'use strict';

var _ = require('lodash');
var Attendance = require('./attendance.model');
var mongoose = require('mongoose');
var ClassYear = require('../classyear/classyear.model');
var User = require('../user/user.model');
var SmallGroup = require('../smallgroup/smallgroup.model');
var config = require('../../config/environment');

function isoDateToTime(isoDate){
  var date = new Date(isoDate);
  date.setHours(0,0,0,0);
  return date.getTime();
}

function isSmallAttendance(submission){
  return !submission.bonusDay && submission.smallgroup
}

function isSmallBonusAttendance(submission){
  return submission.bonusDay && submission.smallgroup
}

function isFullAttendance(submission){
  return !submission.bonusDay && !submission.smallgroup
}

function isFullBonusAttendance(submission){
  return submission.bonusDay && !submission.smallgroup
}

// Check if a userId is present today
var getPresent = function(userId, date, classYearId, cb){
  var callback = cb || function(){};
  Attendance.find({user:userId, date: date, classYear:classYearId}, function (err, attendance) {
    if (err) {return callback(err)}
    return callback(err, attendance);
  });
};
var checkAttendanceForDate = function(user, classYear, date, cb){
  return getPresent(user._id, isoDateToTime(date), classYear._id, function(err,userAttendance){
    if (err) {return cb(err)}
    var submitted = {full: false, small: false, fullBonus: false, smallBonus: false}
    // Check what types of attendance the user has submitted today
    for (var a = 0; a < userAttendance.length ; a++){
      if (userAttendance[a].bonusDay && !userAttendance[a].smallgroup){
        submitted.fullBonus = userAttendance[a];
      }
      else if (userAttendance[a].bonusDay && userAttendance[a].smallgroup){
        submitted.smallBonus = userAttendance[a];
      }
      else if (userAttendance[a].smallgroup){
        submitted.small = userAttendance[a];
      }
      else{
        submitted.full = userAttendance[a];
      }
    }
    return cb(err,submitted);
  });
};

var saveAttendance = function(classYearId, userId, date, code, needsVerification, bonusDay, smallgroup,cb){
  return Attendance.create({
    classYear: classYearId,
    user: userId,

    date: isoDateToTime(date),
    datetime: date,

    bonusDay: bonusDay,
    smallgroup: smallgroup,

    verified: !needsVerification,
    code: code,
  },cb);
};

// *******************************************************
// Get list of attendance submissions
// Restricted to mentors
// router.get('/', auth.isAuthenticated(), controller.index);
exports.index = function(req, res) {
    return ClassYear.getCurrent(function(err, classYear){
      if (err) {return handleError(err)}
      var classYearId = classYear._id;

      return Attendance.find({classYear:classYearId}).exec(function (err, attendance) {
        if(err) { return handleError(res, err); }
        return res.json(200, attendance);
      });
    });
};

// *******************************************************

// *******************************************************
// Get a single attendance submission by id
// Restricted to authenticated users
// router.get('/:id', auth.isAuthenticated(), controller.show);
exports.show = function(req, res) {
  Attendance.findById(req.params.id, function (err, attendance) {
    if(err) { return handleError(res, err); }
    if(!attendance) { return res.sendStatus(404); }
    return res.json(attendance);
  });
};
// *******************************************************

// *******************************************************
// Deletes an attendance submission from the DB.
// Restricted to mentor
// router.delete('/:id', auth.hasRole('mentor'), controller.destroy);
exports.destroy = function(req, res) {
  Attendance.findById(req.params.id, function (err, attendance) {
    if(err) { return handleError(res, err); }
    if(!attendance) { return res.sendStatus(404); }
    attendance.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.sendStatus(204);
    });
  });
};
// *******************************************************

// *******************************************************
// Creates a new attendance submission in the DB.
// NOT FOR NORMAL USE : does not generate required data for submission
// Restricted to admins
// router.post('/', auth.hasRole('admin'), controller.create);
exports.create = function(req, res) {
  Attendance.create(req.body, function(err, attendance) {
    if(err) { return handleError(res, err); }
    return res.json(201, attendance);
  });
};
// *******************************************************

// *******************************************************
// Updates an existing attendance submission in the DB.
// NOT FOR NORMAL USE : does not generate required data for submission
// Restricted to admins
// router.put('/:id', auth.hasRole('admin'), controller.update);
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Attendance.findById(req.params.id, function (err, attendance) {
    if (err) { return handleError(res, err); }
    if(!attendance) { return res.sendStatus(404); }
    var updated = _.merge(attendance, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, attendance);
    });
  });
};
// *******************************************************

// *******************************************************
// Verifies an existing attendance submission in the DB.
// Restricted to mentors
// router.put('/:id/verify', auth.hasRole('mentor'), controller.verifyAttendanceById);
exports.verifyAttendanceById = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Attendance.findById(req.params.id, function (err, attendance) {
    if (err) { return handleError(res, err); }
    if(!attendance) { return res.sendStatus(404); }
    attendance.verified = true;
    attendance.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, attendance);
    });
  });
};
// *******************************************************


// *******************************************************
// Verify users large group attendance for today, available only to mentors
// router.post('/present/:user/full', hasRole('mentor'),controller.verifyFullAttendance);
exports.verifyFullAttendance = function(req,res){
  var userId = req.params.id;
  return ClassYear.getCurrent(function(err, classYear){
    if (err) {return handleError(err)}
    var classYearId = classYear._id;
    return getPresent(userId, isoDateToTime(new Date()), classYear._id, function(err,userAttendance){
      if (err) {return handleError(err)}
      if (!userAttendance.length){
        return res.status(400).json('No attendance found');
      }
      for (var a = 0; a < userAttendance.length; a++){
        if (!userAttendance.smallgroup){
          userAttendance[a].verified = true;
          userAttendance[a].save();
        }
      }
      return res.sendStatus(200);

    });
  });
};
// *******************************************************

// *******************************************************
// Verify users small group attendance, available only to mentors
// TODO: verify that mentor is part of the smallgroup
// router.post('/present/:user/small', auth.hasRole('mentor'), controller.verifySmallAttendance);
exports.verifySmallAttendance = function(req,res){
  var userId = req.params.id;
  return ClassYear.getCurrent(function(err, classYear){
    if (err) {return handleError(err)}
    var classYearId = classYear._id;
    return getPresent(userId, isoDateToTime(new Date()), classYear._id, function(err,userAttendance){
      if (err) {return handleError(err)}
      if (!userAttendance.length){
        return res.status(400).json('No attendance found');
      }
      for (var a = 0; a < userAttendance.length; a++){
        if (userAttendance.smallgroup){
          userAttendance[a].verified = true;
          userAttendance[a].save();
        }
      }
      return res.sendStatus(200);
    });
  });
};
// *******************************************************

// *******************************************************
//get the list of attending students on a date
//router.get('/code/attendees/:dateCode',auth.hasRole('mentor'), controller.getAttendees);
exports.getAttendees = function(req,res){
  return Attendance.find({code:req.params.dateCode})
    .exec(function (err,results){
        var userIds = results.map(function(e){ return e.user } );
        User.find({_id : {$in : userIds } },{"name" : 1}, function(err, users){
        res.json(users);
        })
    })
}
// *******************************************************

// *******************************************************
// Get all attendance for a specific user (or current user) in the current classyear
// router.get('/present/me', auth.isAuthenticated(), controller.getAttendanceMe);
// router.get('/present/:user', auth.hasRole('mentor'), controller.getAttendance);

// Get all attendance for a specific user (or current user) in the current class year
var getAttendance = function(userId, classYearId, cb){
  var callback = cb || function(){};
  Attendance.find({user:userId, classYear:classYearId}, function (err, attendance) {
    if (err) {return handleError(err)}
    return callback(attendance);
  });
};
exports.getAttendance = function(req, res) {
  var userId = req.params.user;
  return ClassYear.getCurrent(function(err, classYear){
    if (err) {return handleError(err)}
    var classYearId = classYear._id;
    getAttendance(userId, classYearId, function(userAttendance){
      if (err) {return handleError(err)}
      return res.json(userAttendance);
    });
  });
};
exports.getAttendanceMe = function(req, res) {
  req.params.user = req.user._id
  exports.getAttendance(req,res);
};
// *******************************************************


// *******************************************************
// Get attendance for a specific user (or current user) on a date
// router.get('/present/:user/today', auth.hasRole('mentor'), controller.present);
// router.get('/present/:user/:date', auth.hasRole('mentor'), controller.present);
//
// router.get('/present/me/today', auth.isAuthenticated(), controller.presentMe);
// router.get('/present/me/:date', auth.isAuthenticated(), controller.presentMe);


exports.present = function(req, res) {
  var date = req.params.date;
  if (req.params.date === 'today'){
    date = isoDateToTime(new Date());
  }
  else{
    date = isoDateToTime(req.params.date);
  }
  var userId = req.params.user;
  return ClassYear.getCurrent(function(err, classYear){
    if (err) {return handleError(err)}
    var classYearId = classYear._id;
    getPresent(userId, date, classYearId, function(err,userAttendance){
      if (err) {return handleError(err)}
      return res.json(userAttendance);
    });
  });
};
exports.presentMe = function(req, res) {
  req.params.user = req.user._id
  exports.present(req,res);
};
// *******************************************************

// *******************************************************
// Mark attendance as present, subject to verification
// router.post('/attend', auth.isAuthenticated(), controller.attend);
exports.attend = function(req,res){
  var user = req.user;
  var code = req.body.dayCode;
  if (!code) {return res.status(400).json('No Code Submitted');}
  console.log("Code",code)
  // Uppercase code from client so it is case-insensitive. This must happen
  // after the above check, otherwise toUpperCase() might not exist.
  code = code.toUpperCase();
  // Check code against current class year
  return ClassYear.getCurrent(function(err, classYear){
    if (err) {return handleError(err)}
    return checkAttendanceForDate(user,classYear,new Date(),function(err, submitted){
      if (err) {return handleError(err)}
      // Check if the user needs to verify, with config.attendanceVerificationRatio chance
      var needsVerification = Math.random() < config.attendanceVerificationRatio ? true : false;
      // Full group, not a bonus day
      console.log("classYear.dayCode",classYear.dayCode)
      console.log("classYear.bonusDayCode",classYear.bonusDayCode)
      if (classYear.dayCode === code){
        // Check if the user already submitted a full group, non bonus attendance
        if (submitted.full){
          // if it is already submitted, return

          return res.status(409).json('Full group attendance already recorded: ' + submitted.full.verified);
        }
        // if not, create the attendance object
        return saveAttendance(
          classYear._id,  // classYearId
          user._id, // userId
          new Date(), // date
          code, // code
          needsVerification, // needsVerification
          false, // bonusDay
          false, // smallgroup
          function(err,submission){
          if (err) {return handleError(err)}
          return res.status(200).json({'type':'Full group attendance', 'unverified': needsVerification});
        });
      }
      // Full group & bonus day
      else if (classYear.bonusDayCode === code){
        // Check if the user already submitted a full group, bonus attendance
        if (submitted.fullBonus){
          // if it is already submitted, return
          return res.status(409).json('Full group bonus attendance already recorded: ' + submitted.fullBonus.verified);
        }
        // if not, create the attendance object
        return saveAttendance(
          classYear._id,  // classYearId
          user._id, // userId
          new Date(), // date
          code, // code
          needsVerification, // needsVerification
          true, // bonusDay
          false, // smallgroup
          function(err,submission){
          if (err) {return handleError(err)}
          return res.status(200).json({'type':'Full group bonus attendance', 'unverified': needsVerification});
        });
      }
      // Classyear attendance code and bonus code was incorrect, try small group
      else{
        return SmallGroup.findOne({"students":user._id, "classYear":classYear._id}, function(err, smallgroup){
          if (err) {return handleError(err)}
          // if the user has no smallgroup, they cannont submit smallgroup  attendance
          if (!smallgroup){
              return res.status(400).json('No small group found or incorrect daycode!');
            }

          // Small group, and not a bonus day
          console.log("smallgroup.dayCode",smallgroup.dayCode)
          console.log("smallgroup.bonusDayCode",smallgroup.bonusDayCode)

          if (smallgroup.dayCode === code){
            // Check if the user already submitted a small group, non-bonus attendance
            if (submitted.small){
              // if it is already submitted, return
              return res.status(409).json('Small group attendance already recorded: ' + submitted.small.verified);
            }
            // if not, create the attendance object
            return saveAttendance(
              classYear._id,  // classYearId
              user._id, // userId
              new Date(), // date
              code, // code
              needsVerification, // needsVerification
              false, // bonusDay
              true, // smallgroup
              function(err,submission){
              if (err) {return handleError(err)}
              return res.status(200).json({'type':'Small group attendance', 'unverified': needsVerification});
            });
          }
          // Small group & bonus day
          else if (smallgroup.bonusDayCode === code){
            // Check if the user already submitted a small group & bonus attendance
            if (submitted.smallBonus){
              // if it is already submitted, return
              return res.status(409).json('Small group bonus attendance already recorded: ' + submitted.smallBonus.verified);
            }
            // if not, create the attendance object
            return saveAttendance(
              classYear._id,  // classYearId
              user._id, // userId
              new Date(), // date
              code, // code
              needsVerification, // needsVerification
              true, // bonusDay
              true, // smallgroup
              function(err,submission){
              if (err) {return handleError(err)}
              return res.status(200).json({'type':'Small group bonus attendance', 'unverified': needsVerification});
            });
          }
          else {
            return res.status(400).json('Incorrect Day Code!');
          }
        });
      }
    });
  });
};
// *******************************************************


// *******************************************************
// Set attendance as present (no verification)
// router.post('/attend/:user/small', auth.hasRole('mentor'), controller.setAttendanceSmall);
// router.post('/attend/:user/full', auth.hasRole('mentor'), controller.setAttendanceFull);
// router.post('/attend/:user/smallBonus', auth.hasRole('mentor'), controller.setAttendanceSmallBonus);
// router.post('/attend/:user/fullBonus', auth.hasRole('mentor'), controller.setAttendanceFullBonus);

// Get data for submitting attendance, then pass it to saveAttendance
var getUserAndDateParams = function(req, cb){
  var userId = req.params.user;
  return User.findById(userId, function(err, user){
    if (err) {return cb(err)}
    var date = req.params.date;
    if (!req.params.date || req.params.date === 'today'){
      date = isoDateToTime(new Date());
    }
    else{
      date = isoDateToTime(req.params.date);
    }
    var userId = req.params.user;
    return ClassYear.getCurrent(function(err, classYear){
      if (err) {return cb(err)}
      var classYearId = classYear._id;
      return cb(err,user,classYear,date)
    });
  });
};

// Endpoints for submitting attendance, then pass it to setAttendanceInfo
exports.setAttendanceSmall = function(req, res) {
  return getUserAndDateParams(req, function(err, user, classYear, date){
    if (err) {return handleError(err)}
    return checkAttendanceForDate(user,classYear,date,function(err, submitted){
      if (err) {return handleError(err)}
      // Check if the user already submitted a small group, non bonus attendance
      if (submitted.small){
        // if it is already valid, return
        var submission = submitted.small;
        if (submission.verified){
          return res.status(400).json('Small group attendance already recorded: ' + submission.verified);
        }
        // Otherwise, verify it and return
        else{
          submission.verified = true;
          submission.save();
          return res.status(200).json({'type':'Small group attendance', 'unverified': false});
        }
      }
      // if not, create the attendance object
      else{
        return saveAttendance(
          classYear._id,  // classYearId
          user._id, // userId
          date, // date
          'manual', // code
          false, // needsVerification
          false, // bonusDay
          true, // smallgroup
          function(err,submission){
          if (err) return handleError(err);
          // saved
          return res.status(200).json({'type':'Small group attendance', 'unverified': false});
        });
      }
    })
  });
};
exports.setAttendanceFull = function(req, res) {
  return getUserAndDateParams(req, function(err, user, classYear, date){
    if (err) {return handleError(err)}
    return checkAttendanceForDate(user,classYear,date,function(err, submitted){
      if (err) {return handleError(err)}
      // Check if the user already submitted a full group, non-bonus attendance
      if (submitted.full){
        // if it is already valid, return
        var submission = submitted.full;
        if (submission.verified){
          return res.status(400).json('Full group attendance already recorded: ' + submission.verified);
        }
        // Otherwise, verify it and return
        else{
          submission.verified = true;
          submission.save();
          return res.status(200).json({'type':'Full group attendance', 'unverified': false});
        }
      }
      // if not, create the attendance object
      else{
        return saveAttendance(
          classYear._id,  // classYearId
          user._id, // userId
          date, // date
          'manual', // code
          false, // needsVerification
          false, // bonusDay
          false, // smallgroup
          function(err,submission){
          if (err) return handleError(err);
          // saved
          return res.status(200).json({'type':'Full group attendance', 'unverified': false});
        });
      }
    });
  });
};

exports.setAttendanceSmallBonus = function(req, res) {
  return getUserAndDateParams(req, function(err, user, classYear, date){
    if (err) {return handleError(err)}
    return checkAttendanceForDate(user,classYear,date,function(err, submitted){
      if (err) {return handleError(err)}
      // Check if the user already submitted a small group & bonus attendance
      if (submitted.smallBonus){
        // if it is already valid, return
        var submission = submitted.smallBonus;
        if (submission.verified){
          return res.status(400).json('Small group bonus attendance already recorded: ' + submission.verified);
        }
        // Otherwise, verify it and return
        else{
          submission.verified = true;
          submission.save();
          return res.status(200).json({'type':'Small group bonus attendance', 'unverified': false});
        }
      }
      else{
        // if not, create the attendance object
        return saveAttendance(
          classYear._id,  // classYearId
          user._id, // userId
          date, // date
          'manual', // code
          false, // needsVerification
          true, // bonusDay
          true, // smallgroup
          function(err,submission){
          if (err) return handleError(err);
          // saved
          return res.status(200).json({'type':'Small group bonus attendance', 'unverified': false});
        });
      }
    });
  });
};
exports.setAttendanceFullBonus = function(req, res) {
  return getUserAndDateParams(req, function(err, user, classYear, date){
    if (err) {return handleError(err)}
    return checkAttendanceForDate(user,classYear,date,function(err, submitted){
      if (err) {return handleError(err)}
      // Check if the user already submitted a full group & bonus attendance
      if (submitted.fullBonus){
        // if it is already valid, return
        var submission = submitted.fullBonus;
        if (submission.verified){
          return res.status(400).json('Full group bonus attendance already recorded: ' + submission.verified);
        }
        // Otherwise, verify it and return
        else{
          submission.verified = true;
          submission.save();
          return res.status(200).json({'type':'Full group bonus attendance', 'unverified': false});
        }
      }
      // if not, create the attendance object
      else{
        return saveAttendance(
          classYear._id,  // classYearId
          user._id, // userId
          date, // date
          'manual', // code
          false, // needsVerification
          true, // bonusDay
          false, // smallgroup
          function(err,submission){
          if (err) return handleError(err);
          // saved
          return res.status(200).json({'type':'Full group bonus attendance', 'unverified': false});
        });
      }
    });
  });
};
// *******************************************************


// *******************************************************
// Gets all users with unverifed attendance for today
// router.get('/unverified/:date', auth.hasRole('mentor'), controller.getUnverifiedAttendanceUsers);
// router.get('/unverified/today', auth.hasRole('mentor'), controller.getUnverifiedAttendanceUsers);

exports.getUnverifiedAttendanceUsers = function(req,res){
  var date = req.params.date;
  if (req.params.date === 'today'){
    date = isoDateToTime(new Date());
  }
  else{
    date = isoDateToTime(req.params.date);
  }
  ClassYear.getCurrent(function(err, classYear){
    if (err) {return handleError(err)}
    var classYearId = classYear._id;
    Attendance.find({verified:false, date: date, classYear:classYearId})
    .populate('user')
    .exec(function (err, attendance) {
      if(err) { return handleError(res, err); }
      return res.json(attendance);;
    });
  });
};
// *******************************************************


// *******************************************************
// Gets all users with full group unverifed attendance for today
// router.get('/unverified/:date/full',  auth.hasRole('mentor'), controller.getUnverifiedFullAttendanceUsers);
// router.get('/unverified/today/full',  auth.hasRole('mentor'), controller.getUnverifiedFullAttendanceUsers);

exports.getUnverifiedFullAttendanceUsers = function(req,res){
  var date = req.params.date;
  if (req.params.date === 'today'){
    date = isoDateToTime(new Date());
  }
  else{
    date = isoDateToTime(req.params.date);
  }
  ClassYear.getCurrent(function(err, classYear){
    if (err) {return handleError(err)}
    var classYearId = classYear._id;

    Attendance.find({verified:false, smallgroup:false, date: date, classYear:classYearId})
    .populate('user')
    .exec(function (err, attendance) {
      if(err) { return handleError(res, err); }

      return res.json(attendance);;
    });
  });
};
// *******************************************************


// *******************************************************
// Gets all users with unverifed small group attendance for today
// router.get('/unverified/today/small', auth.hasRole('mentor'), controller.getUnverifiedSmallAttendanceUsers);
// router.get('/unverified/:date/small', auth.hasRole('mentor'), controller.getUnverifiedSmallAttendanceUsers);

exports.getUnverifiedSmallAttendanceUsers = function(req,res){

  var date = req.params.date;
  if (req.params.date === 'today'){
    date = isoDateToTime(new Date());
  }
  else{
    date = isoDateToTime(req.params.date);
  }
  ClassYear.getCurrent(function(err, classYear){
    if (err) {return handleError(err)}
    var classYearId = classYear._id;
    Attendance.find({verified:false, smallgroup:true, date: date, classYear:classYearId})
    .populate('user')
    .exec(function (err, attendance) {
      if(err) { return handleError(res, err); }
      return res.json(attendance);;
    });
  });
};
// *******************************************************


function handleError(res, err) {
  return res.status(500).json(err);
}
