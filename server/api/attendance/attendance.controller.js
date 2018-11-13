'use strict';

const _ = require('lodash');
const Attendance = require('./attendance.model');
const mongoose = require('mongoose');
const ClassYear = require('../classyear/classyear.model');
const User = require('../user/user.model');
const SmallGroup = require('../smallgroup/smallgroup.model');
const config = require('../../config/environment');
const util = require('../../components/utilities')

function isSmallAttendance(submission) {
  return !submission.bonusDay && submission.smallgroup
}

function isSmallBonusAttendance(submission) {
  return submission.bonusDay && submission.smallgroup
}

function isFullAttendance(submission) {
  return !submission.bonusDay && !submission.smallgroup
}

function isFullBonusAttendance(submission) {
  return submission.bonusDay && !submission.smallgroup
}

// Check if a userId is present today
const getPresent = (userId, date, classYearId, cb) => {
  const callback = cb || () => {};
  Attendance.find({user:userId, date: date, classYear:classYearId}, (err, attendance) => {
    if (err) { return callback(err) }
    return callback(err, attendance);
  });
};
const checkAttendanceForDate = (user, classYear, date, cb) => {
    return getPresent(user._id, date, classYear._id, (err,userAttendance) => {
    if (err) { return cb(err) }
    const submitted = {full: false, small: false, fullBonus: false, smallBonus: false}
    // Check what types of attendance the user has submitted today
    for (let a = 0; a < userAttendance.length ; a++){
      if (userAttendance[a].bonusDay && !userAttendance[a].smallgroup) {
        submitted.fullBonus = userAttendance[a];
      }
      else if (userAttendance[a].bonusDay && userAttendance[a].smallgroup) {
        submitted.smallBonus = userAttendance[a];
      }
      else if (userAttendance[a].smallgroup) {
        submitted.small = userAttendance[a];
      }
      else{
        submitted.full = userAttendance[a];
      }
    }
    return cb(err,submitted);
  });
};

const saveAttendance = (classYearId, userId, date, code, needsVerification, bonusDay, smallgroup,cb) => {
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


/**
* @api {get} /api/attendance/ index
* @apiName index
* @apiGroup Attendance
* @apiDescription Get list of attendance submissions
* @apiPermission Restricted to mentors
* @apiSuccess {Collection} root Collection of all attendance submissions.
* @apiError (500) {json} handleError Could not retrieve attendance submissions and runs handleError function.
*/
exports.index = async (req, res) => {
    const classYear = await ClassYear.getCurrent().catch((err) => handleError(err))
    const classYearId = classYear._id;

    return Attendance.find({classYear:classYearId}).exec((err, attendance) => {
        if (err) { return handleError(res, err); }
        return res.json(200, attendance);
    });
};

/**
* @api {get} /api/attendance/ show
* @apiName show
* @apiGroup Attendance
* @apiDescription Get a single attendance submission by id
* @apiPermission Restricted to authenticated users
* @apiSuccess {json} root json for single attendance submission.
* @apiError (500) {json} handleError Could not retrieve attendance submission and runs handleError function.
*/
exports.show = (req, res) => {
  Attendance.findById(req.params.id, (err, attendance) => {
    if (err) { return handleError(res, err); }
    if (!attendance) { return res.sendStatus(404); }
    return res.json(attendance);
  });
};

/**
* @api {delete} /api/attendance/ destroy
* @apiName destroy
* @apiGroup Attendance
* @apiDescription Deletes an attendance submission from the DB
* @apiPermission Restricted to mentor
* @apiSuccess root Removes an attendance submission.
* @apiError (500) {json} handleError Could not retrieve attendance submissions and runs handleError function.
*/
exports.destroy = (req, res) => {
  Attendance.findById(req.params.id, (err, attendance) => {
    if (err) { return handleError(res, err); }
    if (!attendance) { return res.sendStatus(404); }
    attendance.remove((err) => {
      if (err) { return handleError(res, err); }
      return res.sendStatus(204);
    });
  });
};

/**
* @api {put} /api/attendance/verify verifyAttendanceById
* @apiName verifyAttendanceById
* @apiGroup Attendance
* @apiDescription Verifies an existing attendance submission in the database.
* @apiPermission Restricted to mentors
* @apiSuccess root Sets attendance.verified true and saves.
* @apiError (500) {json} handleError Could not retrieve attendance submissions and runs handleError function.
*/
exports.verifyAttendanceById = (req, res) => {
  if (req.body._id) { delete req.body._id; }
  Attendance.findById(req.params.id, (err, attendance) => {
    if (err) { return handleError(res, err); }
    if (!attendance) { return res.sendStatus(404); }
    attendance.verified = true;
    attendance.save((err) => {
      if (err) { return handleError(res, err); }
      return res.json(200, attendance);
    });
  });
};

/**
* @api {get} /api/attendance/ getAttendees
* @apiName getAttendees
* @apiGroup Attendance
* @apiDescription Verifies an existing attendance submission in the database.
* @apiPermission public
* @apiSuccess root List of all attending students for a daycode
*/
exports.getAttendees = (req,res) => {
  return Attendance.find({code:req.params.dateCode})
    .exec((err,results) => {
        const userIds = results.map((e) => { return e.user } );
        User.find({_id : {$in : userIds } },{'name' : 1}, (err, users) => {
        res.json(users);
        })
    })
}

/**
* @api {get} /api/attendance/ getAttendance
* @apiName getAttendance
* @apiGroup Attendance
* @apiDescription For a specific (current) user, get all attendance for the current class year.
* @apiPermission public
* @apiSuccess root List of all attending students for a daycode
* @apiError (500) {json} handleError Could not retrieve attendance submissions and runs handleError function.
*/
// router.get('/present/me', auth.isAuthenticated(), controller.getAttendanceMe);
// router.get('/present/:user', auth.hasRole('mentor'), controller.getAttendance);

// Get all attendance for a specific user (or current user) in the current class year
const getAttendance = (userId, classYearId, cb) => {
  const callback = cb || () => {};
  Attendance.find({user:userId, classYear:classYearId}, (err, attendance) => {
    if (err) { return handleError(err) }
    SmallGroup.findOne({classYear:classYearId, students:userId}, (err, smallgroup) =>{
      if (err) { return handleError(err) }
      if (smallgroup !== null) {
        for (let i = 0; i < smallgroup.dayCodes.length; i++) {
          const smallAttend = smallgroup.dayCodes[i];
          const smallDate = util.setToZero(smallAttend.date);

          let found = false;
          for (let j = 0; j < attendance.length; j++) {
            const attend = attendance[j];
            const attendDate = util.setToZero(attend.date)
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
      ClassYear.findOne({current:true}, (err, classyear) => {
        if (err) {return handleError(err)}
        if (classyear !== null) {
          for (let i = 0; i < classyear.dayCodes.length; i++) {
            const classAttend = classyear.dayCodes[i];
            const classDate = util.setToZero(classAttend.date);
            let found = false;
            for (let j = 0; j < attendance.length; j++) {
              const attend = attendance[j];
              const attendDate = util.setToZero(attend.date)
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

/**
* @api {get} /api/attendance/ getAttendance
* @apiName getAttendance
* @apiGroup Attendance
* @apiDescription For a specific (current) user, get all attendance for the current class year.
* @apiPermission none
* @apiSuccess {json} root Returns user's attendance
* @apiError (500) {json} handleError Could not retrieve attendance submissions and runs handleError function.
*/
exports.getAttendance = async (req, res) => {
  const userId = req.params.user;
  const classYear = await ClassYear.getCurrent().catch((err) => handleError(err))
  const classYearId = classYear._id;
  
  getAttendance(userId, classYearId, (userAttendance, err) => {
    if (err) { return handleError(err) }
    return res.json(userAttendance);
  });
};

/**
* @api {get} /api/attendance/ getAttendanceMe
* @apiName getAttendanceMe
* @apiGroup Attendance
* @apiDescription For a specific (current) user, get all attendance for the current class year by calling getAttendance function.
* @apiPermission none - Sets user id
* @apiSuccess {json} root Returns user's attendance
* @apiError (500) {json} handleError Could not retrieve attendance submissions and runs handleError function.
*/
exports.getAttendanceMe = (req, res) => {
  req.params.user = req.user._id
  exports.getAttendance(req,res);
};

/**
* @api {get} /api/attendance/present/:user/:date present
* @apiName present
* @apiGroup Attendance
* @apiDescription Confirms the attendance for a given day.
* @apiPermission none
* @apiSuccess {json} root Returns user's attendance via userAttendance
* @apiError (500) {json} handleError Could not retrieve attendance submissions and runs handleError function.
*/
// Get attendance for a specific user (or current user) on a date
// router.get('/present/:user/today', auth.hasRole('mentor'), controller.present);
// router.get('/present/:user/:date', auth.hasRole('mentor'), controller.present);
//
// router.get('/present/me/today', auth.isAuthenticated(), controller.presentMe);
// router.get('/present/me/:date', auth.isAuthenticated(), controller.presentMe);
exports.present = async (req, res) => {
  let date = req.params.date;
  if (req.params.date === 'today'){
    date = util.convertToMidnight(new Date());
  }
  else{
    date = util.convertToMidnight(req.params.date);
  }
  const userId = req.params.user;
  const classYear = await ClassYear.getCurrent().catch((err) => handleError(err))
  const classYearId = classYear._id;
  
  getPresent(userId, date, classYearId, (err,userAttendance) => {
    if (err) { return handleError(err) }
    return res.json(userAttendance);
  });
};

/**
* @api {get} /api/attendance/presentMe presentMe
* @apiName presentMe
* @apiGroup Attendance
* @apiDescription Confirms the attendance by user id for a given day by calling the present function.
* @apiPermission Sets user id
* @apiSuccess {json} root Calls the present function for the user by id
* @apiError (500) {json} handleError Could not retrieve attendance submissions and runs handleError function.
*/
exports.presentMe = (req, res) => {
  req.params.user = req.user._id
  exports.present(req, res);
};

/**
* @api {post} /api/attendance/attend attend
* @apiName attend
* @apiGroup Attendance
* @apiDescription Mark attendance as present, subject to verification
* @apiPermission none
* @apiSuccess {json} root Confirms attendance code against current class year, checks if user needs to verify, check for full group/small group/bonus day, or creates attendance object
* @apiError (500) {json} handleError Could not retrieve attendance submissions and runs handleError function.
*/
// Mark attendance as present, subject to verification
// router.post('/attend', auth.isAuthenticated(), controller.attend);
exports.attend = async (req,res) => {
  const user = req.user;
  let code = req.body.dayCode;
  if (!code) { return res.status(400).json('No Code Submitted'); }
  // Uppercase code from client so it is case-insensitive. This must happen
  // after the above check, otherwise toUpperCase() might not exist.
  code = code.toUpperCase();
  // Check code against current class year
  const classYear = await ClassYear.getCurrent().catch((err) => handleError(err))

  return checkAttendanceForDate(user,classYear,util.convertToMidnight(new Date()), (err, submitted) => {
    if (err) { return handleError(err) }
    // Check if the user needs to verify, with config.attendanceVerificationRatio chance
    const needsVerification = Math.random() < config.attendanceVerificationRatio ? true : false;
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
        (err,submission) => {
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
        (err,submission) => {
        if (err) {return handleError(err)}
        return res.status(200).json({'type':'Full group bonus attendance', 'unverified': needsVerification});
      });
    }
    else {
    // Classyear attendance code and bonus code was incorrect, try small group
      return SmallGroup.findOne({'students':user._id, 'classYear':classYear._id})
      .select('+dayCodes.code')
      .exec((err, smallgroup) => {
        if (err) {return handleError(err)}
        //if the user has no smallgroup,try comparing the code submission with the lastest dayCodes
        if (!smallgroup){
          joinGroupAndSubmit(user,code,classYear,needsVerification, (err,ret) => {
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
            (err,submission) => {
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
            (err,submission) => {
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
};

/**
* @apiName joinGroupAndSubmit
* @apiGroup Attendance
* @apiDescription Allows user to join group and submit attendance
* @apiPermission none
* @apiSuccess root Returns the saveAttendance object with the parameters
* @apiError Returns callback error function for unverification
*/
function joinGroupAndSubmit(user,code,classYear,needsVerification,callback){
  SmallGroup.findOne({'dayCodes.code':code,'classYear':classYear._id})
  .select('+dayCodes.code')
  .exec((err,smallgroup) => {
    if (err) { return callback(err,null) }
    if (!smallgroup) { return callback(err,null) }
    const lastestCode = smallgroup.dayCode;
    const lastestBonusCode = smallgroup.bonusDayCode;
    if ((lastestCode && lastestCode === code) ||
      (lastestBonusCode && lastestBonusCode === code)) {
      //check if today's small group codes match with the submission
      SmallGroup.findOneAndUpdate({_id: smallgroup._id}, {
          $addToSet: { students : user._id }
      }, (err, groupJoined) => {
          if (err) { return callback(err,null) }
          return saveAttendance(
            classYear._id,  // classYearId
            user._id, // userId
            util.convertToMidnight(new Date()), // date
            code, // code
            needsVerification, // needsVerification
            lastestBonusCode === code, // bonusDay
            true, // smallgroup
            (err,submission) => {
            if (err) { return callback(err) }
            return callback(null,{'type':'Small group attendance', 'unverified': needsVerification});
          });
      });
    }
    else{ return callback(err) }
  })
}

/**
* @apiName getUserAndDateParams
* @apiGroup Attendance
* @apiDescription Get data for submitting attendance as present, then pass it to saveAttendance
* @apiPermission none
* @apiSuccess root pass data for attendance submission to saveAttendance
*/
// Set attendance as present (no verification)
// router.post('/attend/:user/small', auth.hasRole('mentor'), controller.setAttendanceSmall);
// router.post('/attend/:user/full', auth.hasRole('mentor'), controller.setAttendanceFull);
// router.post('/attend/:user/smallBonus', auth.hasRole('mentor'), controller.setAttendanceSmallBonus);
// router.post('/attend/:user/fullBonus', auth.hasRole('mentor'), controller.setAttendanceFullBonus);
// Get data for submitting attendance, then pass it to saveAttendance
const getUserAndDateParams = async (req, cb) => {
  let userId = req.params.user;
  let user = await User.findById(userId).catch((err) => cb(err))
  let date = req.params.date;
  if (!req.params.date || req.params.date === 'today'){
    date = util.convertToMidnight(new Date());
  }
  else{
    date = util.convertToMidnight(req.params.date);
  }
  userId = req.params.user;

  const classYear = await ClassYear.getCurrent().catch((err) => cb(err))
  const classYearId = classYear._id;
  return cb(err,user,classYear,date)
};

/**
* @api {post} /api/attendance/addManualAttendance addManualAttendance
* @apiName addManualAttendance
* @apiGroup Attendance
* @apiDescription Admin manually adding attendance
* @apiPermission Restricted to admins
* @apiSuccess {json} Returns saveAttendance object, adds attendance for user id with given parameters.
* @apiError (500) {json} handleError Could not retrieve attendance submissions and runs handleError function.
*/
// Adds an attendance entry with the given parameters
// Restricted to admins
// router.post('/attend/:user/manual', auth.hasRole('admin'), controller.attend);
exports.addManualAttendance = async (req, res) => {
  const userId = req.params.user;
  const date = req.body.date;

  const smallgroup = req.body.smallgroup
  const bonusDay = req.body.bonusday;

  let user = await User.findById(userId).catch((err) => handleError(err))

  const classYear = await ClassYear.getCurrent().catch((err) => handleError(err))
    

  return saveAttendance(
      classYear._id,  // classYearId
      user._id, // userId
      util.setToZero(date), // date
      'manual', // code
      false, // needsVerification
      bonusDay, // bonusDay
      smallgroup, // smallgroup
      (err,submission) => {
        if (err) {
          return handleError(err);
        }
        // saved
        return res.status(200).json({saved: true});
  });
}

/**
* @api {get} /api/attendance/ getUnverifiedAttendanceUsers
* @apiName getUnverifiedAttendanceUsers
* @apiGroup Attendance
* @apiDescription Gets all users with unverified attendance for the day
* @apiPermission none
* @apiSuccess {json} root Returns attendance for unverified
* @apiError (500) {json} handleError Could not retrieve attendance submissions and runs handleError function.
*/
// Gets all users with unverifed attendance for today
// router.get('/unverified/:date', auth.hasRole('mentor'), controller.getUnverifiedAttendanceUsers);
// router.get('/unverified/today', auth.hasRole('mentor'), controller.getUnverifiedAttendanceUsers);
exports.getUnverifiedAttendanceUsers = async (req,res) => {
  let date = req.params.date;
  if (req.params.date === 'today'){
    date = util.convertToMidnight(new Date());
  }
  else{
    date = util.convertToMidnight(req.params.date);
  }

  const classYear = await ClassYear.getCurrent().catch((err) => handleError(err))
  const classYearId = classYear._id;
  Attendance.find({verified:false, date: date, classYear:classYearId})
  .populate('user')
  .exec(function (err, attendance) {
    if (err) { return handleError(res, err); }
    return res.json(attendance);
  });
};

/**
* @api {get} /api/attendance/ getUnverifiedFullAttendanceUsers
* @apiName getUnverifiedFullAttendanceUsers
* @apiGroup Attendance
* @apiDescription Gets all users with full group unverified attendance for the day
* @apiPermission none
* @apiSuccess {json} root Returns attendance for full group unverified
* @apiError (500) {json} handleError Could not retrieve attendance submissions and runs handleError function.
*/
// Gets all users with full group unverifed attendance for today
// router.get('/unverified/:date/full',  auth.hasRole('mentor'), controller.getUnverifiedFullAttendanceUsers);
// router.get('/unverified/today/full',  auth.hasRole('mentor'), controller.getUnverifiedFullAttendanceUsers);
exports.getUnverifiedFullAttendanceUsers = async (req,res) => {
  let date = req.params.date;
  if (req.params.date === 'today'){
    date = util.convertToMidnight(new Date());
  }
  else{
    date = util.convertToMidnight(req.params.date);
  }

  const classYear = await ClassYear.getCurrent().catch((err) => handleError(err))
  const classYearId = classYear._id;

  Attendance.find({verified:false, smallgroup:false, date: date, classYear:classYearId})
  .populate('user')
  .exec((err, attendance) => {
    if (err) { return handleError(res, err); }
    return res.json(attendance);
  });
};

/**
* @api {get} /api/attendance/ getUnverifiedSmallAttendanceUsers
* @apiName getUnverifiedSmallAttendanceUsers
* @apiGroup Attendance
* @apiDescription Gets all users with unverified small group attendance for the day
* @apiPermission none
* @apiSuccess {json} root Returns attendance for small group unverified
* @apiError (500) {json} handleError Could not retrieve attendance submissions and runs handleError function.
*/
// Gets all users with unverifed small group attendance for today
// router.get('/unverified/today/small', auth.hasRole('mentor'), controller.getUnverifiedSmallAttendanceUsers);
// router.get('/unverified/:date/small', auth.hasRole('mentor'), controller.getUnverifiedSmallAttendanceUsers);
exports.getUnverifiedSmallAttendanceUsers = async (req,res) => {

  let date = req.params.date;
  if (req.params.date === 'today'){
    date = util.convertToMidnight(new Date());
  }
  else{
    date = util.convertToMidnight(req.params.date);
  }

  const classYear = await ClassYear.getCurrent().catch((err) => handleError(err))

  const classYearId = classYear._id;
  Attendance.find({verified:false, smallgroup:true, date: date, classYear:classYearId})
  .populate('user')
  .exec((err, attendance) => {
    if (err) { return handleError(res, err); }
    return res.json(attendance);
  });
};

/**
* @apiName handleError
* @apiGroup Attendance
* @apiDescription Handles errors
* @apiPermission none
* @apiSuccess {json} root Returns res.status(500).json(err)
*/
// TODO - abstract into API helpers
function handleError(res, err) {
  return res.status(500).json(err);
}
