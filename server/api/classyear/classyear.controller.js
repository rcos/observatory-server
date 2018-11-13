'use strict';

import { handleError, validationError, generateCode, uniqueDayCode } from '../lib/helpers'

const ClassYear = require('./classyear.model');
const Attendance = require('../attendance/attendance.model');
const SmallGroup = require('../smallgroup/smallgroup.model');

/**
* @api {get} /api/classyear Index
* @apiName index
* @apiGroup ClassYear
* @apiDescription Get current ClassYear
* @apiPermission public
* @apiSuccess {Model} The model of the current ClassYear
* @apiError (500) UnknownException Could not retrieve ClassYear collection
*/
exports.index = function(req, res) {
    const query = ClassYear.findOne({'current': true});
  if (req.user && req.user.isAdmin){
      query.select('+dayCodes.code')
  }
    return query.exec((err, classYear) => {
    if (err) { return handleError(res, err); }
    const responseObject = classYear.toObject();
    // Admins should get a day code
    // Generate a day code if one does not already exist
    if (req.user.isAdmin){
        // Admins should get a day code
        // Generate a day code if one does not already exist
        if (classYear.dayCode){
            responseObject.dayCode = classYear.dayCode;
        }
        if (classYear.bonusDayCode){
            responseObject.bonusDayCode = classYear.bonusDayCode;
        }
    }
    return res.status(200).json(responseObject);
  });
};

/**
* @api {get} /api/classyear/semester/:semester GetClassYear
* @apiName getClassYear
* @apiGroup ClassYear
* @apiDescription Get current ClassYear
* @apiPermission admin
* @apiSuccess {Model} The model of the current ClassYear
* @apiError (500) UnknownException Could not retrieve ClassYear collection
*/
// Get a specific class year, Limited to Admins
exports.getClassYear = function(req, res) {
  ClassYear.findOne({
      'semester': req.params.semester
  })
  .select('+dayCodes.code')
  .exec((err, classYear) => {
    if (err) { return handleError(res, err); }
    if (!classYear) return res.send(404);
    var responseObject = classYear.toObject();
    res.json(responseObject);
  })
};

/**
* @api {get} /api/classyear Count Bonus Days
* @apiName countBonusDays
* @apiGroup ClassYear
* @apiDescription Get a specific class year's attendance bonus days
* @apiPermission public
* @apiSuccess {Model} The bonus days of a specific class year
* @apiError (500) UnknownException Could not retrieve ClassYear collection
*/
// NOTE - this controller function is not used
exports.countBonusDays = async function(req, res) {
    const classYear = await ClassYear.getCurrent().catch((err) => handleError(err))
    if (!classYear) return res.send(404);
    const bonusDays = classYear.dayCodes.reduce((previousValue, currentValue) => {
      return previousValue + (currentValue.bonusDay ? 1 : 0); // Add 1 to the count for each bonusday in classYear.dayCodes
    }, 0);
    res.json(bonusDays);
};


/**
* @api {post} /api/classyear Create
* @apiName create
* @apiGroup ClassYear
* @apiDescription Create a new ClassYear
* @apiPermission admin
* @apiSuccess {Model} Sends 204 Success response
* @apiError (500) UnknownException Could not retrieve creat ClassYear
*/
exports.create = async function(req, res) {
  const semester = req.body.semester;
  if (!semester) return handleError(res, "No Semester Specified");
  let classYear = await ClassYear.findOne({
    'semester': semester
  }).catch((err) => handleError(err))
  
  if (classYear){
    // Set existing class year as current class year and do not create
    // a new class year
    classYear.current = true;
  } else {
    // Create new class year and set as current
    classYear = new ClassYear(req.body);
    classYear.current = true;
  }
  classYear = await classYear.save().catch((err) => validationError(res, err));

  // Make sure there are no other current class years
  ClassYear.find({
    'current': true,
    'semester': {$ne : classYear.semester}
  }, (err, otherClassYears) => {

    for (let i = 0 ; i < otherClassYears.length ; i++){
      let otherClassYear = otherClassYears[i];
      if (classYear.semester !== otherClassYear.semester){
        otherClassYear.current = false;
        otherClassYear.save();
      }
    }
  });

  const currentClassYear = await ClassYear.getCurrent().catch((err) => handleError(err))
  global.currentClassYear = currentClassYear;
  res.send(204);
};


/**
* @api {put} /api/classyear/semester/:semester Update
* @apiName update
* @apiGroup ClassYear
* @apiDescription Update class year
* @apiPermission admin
* @apiSuccess {Model} Sends 204 Success response
* @apiError (500) UnknownException Could not updata data.
*/
exports.update = async function(req, res) {
  let classYear = await ClassYear.findOne({
    'semester': req.params.semester
  }).catch((err) => handleError(res, err)) 

  await classYear.update(req.body).catch((err) => handleError(res, err)) 
  
  const currentClassYear = await ClassYear.getCurrent().catch((err) => handleError(err))
	
  global.currentClassYear = currentClassYear;
  res.send(204);
};


/**
* @api {delete} /api/classyear/semester/:semester Destory
* @apiName destory
* @apiGroup ClassYear
* @apiDescription Deletes a class year from the DB.
* @apiPermission admin
* @apiSuccess {Model} no response
* @apiError (500) no response.
*/
exports.destroy = function(req, res) {
  return ClassYear.findOne({
    'semester': req.params.semester
  }, (err, classYear) => {
    classYear.delete();
  });
};


/**
* @api {post} /api/classyear/daycode Daycode
* @apiName daycode
* @apiGroup ClassYear
* @apiDescription Generate a daycode or return the current day code for the current class year
* @apiPermission admin
* @apiSuccess {Model} returning day code for current day
* @apiError (500) UnknownException Could not return a correct code.
*/
exports.daycode = async function(req, res){
  const classYear = await ClassYear.getCurrentCodes().catch((err) => handleError(res, err))
  
  const today = new Date();
  today.setHours(0,0,0,0);
  for (let i = 0;i < classYear.dayCodes.length;i++){
    if (today.getTime() === classYear.dayCodes[i].date.getTime()){
      return res.status(200).json({ code: classYear.dayCodes[i].code }).end()
    }
  }
  //unique code generator, function at the bottom.
  uniqueDayCode(6, (err,dayCode) => {
    if (err) return handleError(res, err);
    const code = dayCode;

    classYear.dayCodes.push({
      date: today,
      code: code,
      bonusDay: req.body.bonusDay ? true : false
    });

    return classYear.save((err, classYear) => {
      if (err) return handleError(res, err);
      return res.status(200).json({ code }).end()
    });
  });
};


/**
* @api {delete} /api/classyear/day/:daycode DeleteDay
* @apiName deleteDay
* @apiGroup ClassYear
* @apiDescription Delete a day code from a classyear and the corresponding daycode submission from attendance
* @apiPermission admin
* @apiSuccess {Model} returing deleted daycode
* @apiError (500) UnknownException Could not delete successfully.
*/
// router.delete('/day/:dayCode', auth.hasRole('admin'), controller.deleteDay);
exports.deleteDay = function(req, res){
    const dayCode = req.params.dayCode;

    return ClassYear.findOneAndUpdate({'current': true}, {
        $pull: { dayCodes: {code : dayCode }}
    })
    .select('+dayCodes.code')
  .exec((err, classYear) => {
        if (err) return handleError(res, err);

            return Attendance.remove({code : dayCode}, (err) => {
          if (err) return handleError(res, err);
           return res.status(200).json(classYear);
        });
    });
};

/**
* @api {put} /api/classyear/displayURP DisplayURP
* @apiName displayURP
* @apiGroup ClassYear
* @apiDescription Toggles URP display
* @apiPermission admin
* @apiSuccess {Model} returing 200
* @apiError (500) UnknownException Could not display URP.
*/
exports.displayURP = async function(req, res) {
  const classYear = await ClassYear.getCurrent().catch((err) => handleError(err))
  return classYear.update(req.body, (err) => {
    if (err) { return handleError(res, err); }
    res.send(200);
  });
};


/**
* @api {get} /api/classyear/displayURP GetDisplayURP
* @apiName getDisplayURP
* @apiDescription Toggles URP display
* @apiPermission public
* @apiSuccess {Model} display URP
* @apiError (500) UnknownException Could not display URP.
*/
exports.getDisplayURP = async function(req, res) {
  const classYear = await ClassYear.getCurrent().catch((err) => handleError(err))
  // if no class year is defined then don't show urp
  if (!classYear) {
    res.json({displayURP: false});
  } else {
    res.json({displayURP:classYear.displayURP});
  }
};
