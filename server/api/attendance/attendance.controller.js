'use strict';

var _ = require('lodash');
var Attendance = require('./attendance.model');
var mongoose = require('mongoose');
var ClassYear = require('../classyear/classyear.model');
var User = require('../user/user.model');
var SmallGroup = require('../smallgroup/smallgroup.model');
var config = require('../../config/environment');
var util = require('../../components/utilities')

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
  return getPresent(user._id, date, classYear._id, function(err,userAttendance){
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

    date: date,
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
//get the list of attending students on a for a daycode
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
    SmallGroup.findOne({classYear:classYearId, students:userId}, function (err, smallgroup) {
      if (err) {return handleError(err)}
      if (smallgroup !== null) {
        for (var i = 0; i < smallgroup.dayCodes.length; i++) {
          var smallAttend = smallgroup.dayCodes[i];
          var smallDate = util.setToZero(smallAttend.date);

          var found = false;
          for (var j = 0; j < attendance.length; j++) {
            var attend = attendance[j];
            var attendDate = util.setToZero(attend.date)
            if (smallDate === attendDate && attend.bonusDay === smallAttend.bonusDay && attend.smallgroup === true) {
              found = true;
              break;
            }
          }
          if (!found) {
            attendance.push(
              {
                date:smallAttend.date,
                bonusDay:smallAttend.bonusDay,
                smallgroup:true,
                verified:false,
                present:false
              }
            );
          }
        }
      }
      ClassYear.findOne({current:true}, function (err, classyear) {
        if (err) {return handleError(err)}
        if (classyear !== null) {
          for (var i = 0; i < classyear.dayCodes.length; i++) {
            var classAttend = classyear.dayCodes[i];
            var classDate = util.setToZero(classAttend.date);
            var found = false;
            for (var j = 0; j < attendance.length; j++) {
              var attend = attendance[j];
              var attendDate = util.setToZero(attend.date)
              if (classDate === attendDate && attend.bonusDay === classAttend.bonusDay && attend.smallgroup === false) {
                found = true;
                break;
              }
            }
            if (!found) {
              attendance.push({
                date:classAttend.date,
                bonusDay:classAttend.bonusDay,
                smallgroup:false,
                verified:false,
                present:false
              });
            }
          }
        }
        return callback(attendance);
      });
    });
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
    date = util.convertToMidnight(new Date());
  }
  else{
    date = util.convertToMidnight(req.params.date);
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
  // Uppercase code from client so it is case-insensitive. This must happen
  // after the above check, otherwise toUpperCase() might not exist.
  code = code.toUpperCase();
  // Check code against current class year
  return ClassYear.getCurrentCodes(function(err, classYear){
    if (err) {return handleError(err)}
    return checkAttendanceForDate(user,classYear,util.convertToMidnight(new Date()),function(err, submitted){
      if (err) {return handleError(err)}
      // Check if the user needs to verify, with config.attendanceVerificationRatio chance
      var needsVerification = Math.random() < config.attendanceVerificationRatio ? true : false;
      // Full group, not a bonus day
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
          util.convertToMidnight(new Date()), // date
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
          util.convertToMidnight(new Date()), // date
          code, // code
          needsVerification, // needsVerification
          true, // bonusDay
          false, // smallgroup
          function(err,submission){
          if (err) {return handleError(err)}
          return res.status(200).json({'type':'Full group bonus attendance', 'unverified': needsVerification});
        });
      }
      else{
      // Classyear attendance code and bonus code was incorrect, try small group
        return SmallGroup.findOne({"students":user._id, "classYear":classYear._id})
    	  .select('+dayCodes.code')
        .exec(function(err, smallgroup){
          if (err) {return handleError(err)}
          //if the user has no smallgroup,try comparing the code submission with the lastest dayCodes
          if (!smallgroup){
            joinGroupAndSubmit(user,code,classYear,needsVerification,function(err,ret){
              if (err) {return res.status(400).json('Incorrect Day Code!')}
              return res.status(200).json(ret);
            })
          }
          // Small group, and not a bonus day
          else if (smallgroup.dayCode === code){
            // Check if the user already submitted a small group, non-bonus attendance
            if (submitted.small){
              // if it is already submitted, return
              return res.status(409).json('Small group attendance already recorded: ' + submitted.small.verified);
            }
            // if not, create the attendance object
            return saveAttendance(
              classYear._id,  // classYearId
              user._id, // userId
              util.convertToMidnight(new Date()), // date
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
              util.convertToMidnight(new Date()), // date
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

function joinGroupAndSubmit(user,code,classYear,needsVerification,callback){
  SmallGroup.findOne({"dayCodes.code":code,"classYear":classYear._id})
  .select('+dayCodes.code')
  .exec(function(err,smallgroup){
    if (err) {return callback(err,null)}
    if (!smallgroup){return callback(err,null)}
    var lastestCode = smallgroup.dayCode;
    var lastestBonusCode = smallgroup.bonusDayCode;
    if((lastestCode && lastestCode === code) ||
      (lastestBonusCode && lastestBonusCode === code)){
      //check if today's small group codes match with the submission
      SmallGroup.findOneAndUpdate({_id: smallgroup._id}, {
          $addToSet: { students : user._id }
      }, function(err, groupJoined){
          if (err) {return callback(err,null)}
          return saveAttendance(
            classYear._id,  // classYearId
            user._id, // userId
            util.convertToMidnight(new Date()), // date
            code, // code
            needsVerification, // needsVerification
            lastestBonusCode === code, // bonusDay
            true, // smallgroup
            function(err,submission){
            if (err) {return callback(err)}
            return callback(null,{'type':'Small group attendance', 'unverified': needsVerification});
          });
      });
    }
    else{return callback(err)}
  })
}

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
      date = util.convertToMidnight(new Date());
    }
    else{
      date = util.convertToMidnight(req.params.date);
    }
    var userId = req.params.user;
    return ClassYear.getCurrent(function(err, classYear){
      if (err) {return cb(err)}
      var classYearId = classYear._id;
      return cb(err,user,classYear,date)
    });
  });
};

// *******************************************************
// Adds an attendance entry with the given parameters
//
// Restricted to admins
// router.post('/attend/:user/manual', auth.hasRole('admin'), controller.attend);
exports.addManualAttendance = function(req, res) {
  var userId = req.params.user;
  var date = req.body.date;

  var smallgroup = req.body.smallgroup
  var bonusDay = req.body.bonusday;

  return User.findById(userId, function(err,user){
    if (err) {
      return handleError(err);
    }
    return ClassYear.getCurrent(function(err, classYear){
      if (err) {
        return handleError(err);
      }

      return saveAttendance(
        classYear._id,  // classYearId
        user._id, // userId
        util.setToZero(date), // date
        'manual', // code
        false, // needsVerification
        bonusDay, // bonusDay
        smallgroup, // smallgroup
        function(err,submission){
          if (err) {
            return handleError(err);
          }
          // saved
          return res.status(200).json({saved: true});
      });
    });
  });
}
// *******************************************************

// *******************************************************
// Gets all users with unverifed attendance for today
// router.get('/unverified/:date', auth.hasRole('mentor'), controller.getUnverifiedAttendanceUsers);
// router.get('/unverified/today', auth.hasRole('mentor'), controller.getUnverifiedAttendanceUsers);

exports.getUnverifiedAttendanceUsers = function(req,res){
  var date = req.params.date;
  if (req.params.date === 'today'){
    date = util.convertToMidnight(new Date());
  }
  else{
    date = util.convertToMidnight(req.params.date);
  }
  ClassYear.getCurrent(function(err, classYear){
    if (err) {return handleError(err)}
    var classYearId = classYear._id;
    Attendance.find({verified:false, date: date, classYear:classYearId})
    .populate('user')
    .exec(function (err, attendance) {
      if(err) { return handleError(res, err); }
      return res.json(attendance);
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
    date = util.convertToMidnight(new Date());
  }
  else{
    date = util.convertToMidnight(req.params.date);
  }
  ClassYear.getCurrent(function(err, classYear){
    if (err) {return handleError(err)}
    var classYearId = classYear._id;

    Attendance.find({verified:false, smallgroup:false, date: date, classYear:classYearId})
    .populate('user')
    .exec(function (err, attendance) {
      if(err) { return handleError(res, err); }

      return res.json(attendance);
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
    date = util.convertToMidnight(new Date());
  }
  else{
    date = util.convertToMidnight(req.params.date);
  }
  ClassYear.getCurrent(function(err, classYear){
    if (err) {return handleError(err)}
    var classYearId = classYear._id;
    Attendance.find({verified:false, smallgroup:true, date: date, classYear:classYearId})
    .populate('user')
    .exec(function (err, attendance) {
      if(err) { return handleError(res, err); }
      return res.json(attendance);
    });
  });
};
// *******************************************************


function handleError(res, err) {
  return res.status(500).json(err);
}
