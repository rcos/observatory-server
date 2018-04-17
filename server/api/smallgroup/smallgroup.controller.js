/**
* Small Group Controller
*/

'use strict';

import { handleError, validationError, generateCode, uniqueDayCode } from '../lib/helpers'

const SmallGroup = require('./smallgroup.model');
const ClassYear = require('../classyear/classyear.model');
const Attendance = require('../attendance/attendance.model');
const User = require('../user/user.model');
const Project = require('../project/project.model');
const util = require('../../components/utilities')

// Get all smallgroups
// Restricted to authenticated users
// router.get('/', auth.isAuthenticated(), controller.index);
// TODO: only return smallgroups for this year
/**
* @api {GET} /api/smallgroup Index
* @APIname index
* @APIgroup SmallGroup Controller
* @apidescription Get list of smallgroups
* @apiSuccess {Collection} index List of smallgroups
* @apiError (Error) 500 Unable to get list
*/
exports.index = (req, res) => {
    SmallGroup.find({}, (err, smallgroups) => {
        if (err) { return handleError(res, err); }
        return res.status(200).json(smallgroups);
    });
};

// Create a new smallgroup for the current class year
// Restricted to mentors
// router.post('/', auth.hasRole('mentor'), controller.create);
/**
* @api {POST} /api/project Create
* @APIname create
* @APIgroup SmallGroup Controller
* @apidescription Create a new smallgroup
* @apiSuccess {HTTP} 200 Successfully created the smallgroup
* @apiError (Error) 500 Unable to create smallgroup
*/
// TODO - we may want to make this an admin-only controller action
exports.create = (req, res) => {

    const user = req.user
    const memberId = req.user._id
    let { name } = req.body

    return ClassYear.getCurrent((err, classYear) => {

        const smallgroup = new SmallGroup({
            name: name, // TODO - pass name in req.body
            classYear: classYear._id,
            enabled: true,
            students: [user._id],
            dayCodes: []
        })

        return smallgroup.save()
        .then((smallgroup) => {
          res.status(200).json({ smallgroup }).end()
        })
        .catch((err) => {
          return handleError(res, err)
        })

    })
}

/**
* @api {POST} /api/project Modify
* @APIname modify
* @APIgroup SmallGroup Controller
* @apidescription Modify the smallgroup
* @apiPermission Mentors
* @apiSuccess {HTTP} 200 Successfully modified the smallgroup
* @apiError (Error) 500 Unable to modify smallgroup
*/

// Modify the smallgroup
// Restricted to mentors
// router.put('/:id', auth.hasRole('mentor'), controller.modify);
exports.modify = (req, res) => {
    const id = req.params.id;
    SmallGroup.update({'_id': id}, req.body.smallgroup, (err) => {
        if (err) {return handleError(res, err);}
        res.sendStatus(200);
    });
};

/**
* @api {DELETE} /api/project Delete
* @APIname delete
* @APIgroup SmallGroup Controller
* @apidescription Delete the smallgroup
* @apiPermission Mentors
* @apiSuccess {HTTP} 200 Successfully deleted the smallgroup
* @apiError (Error) 500 Unable to delete smallgroup
*/
// Delete the smallgroup
// Restricted to mentors
// router.put('/:id', auth.hasRole('mentor'), controller.modify);
exports.delete = (req, res) => {
    var id = req.params.id;
    SmallGroup.findById(id, (err, smallgroup) => {
        if (err) return handleError(res, err);
        smallgroup.remove();
        res.sendStatus(200);
    });
};

/**
* @api {GET} /api/project getSmallGroup
* @APIname getSmallGroup
* @APIgroup SmallGroup Controller
* @apidescription Get the smallgroup by its id
* @apiPermission Authenticated users
* @apiSuccess {json} Model Returns single smallgroup, returns daycode if mentor
* @apiError (Error) 500 Unable to find smallgroup
*/
// Get the smallgroup by id
// Restricted to authenticated users
// Only return daycode is the user is a mentor
// router.get('/:id', auth.isAuthenticated(), controller.getSmallGroup);
exports.getSmallGroup = (req, res) => {
    const id = req.params.id;
    const query = SmallGroup.findById(id)
    if (req.user.isMentor){
        query.select('+dayCodes.code')
    }
    return query.exec((err, smallgroup) => {
        if (err) return handleError(res, err);
        if (!smallgroup) return handleError(res, err);
        const responseObject = smallgroup.toObject();
        if (req.user && req.user.isMentor){
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
};

// Generate a daycode or return the current day code for the smallgroups
// Restricted to mentors
// router.post('/daycode', auth.hasRole('mentor'), controller.daycode);

/**
* @api {GET} /api/project Daycode
* @APIname daycode
* @APIgroup SmallGroup Controller
* @apidescription Get the daycode
* @apiPermission Mentors
* @apiSuccess {json} Model Returns the daycode
* @apiError (Error) 500 Unable to find the daycode
*/
exports.daycode = (req, res) => {
  const userId = req.user.id;

  return ClassYear.getCurrent((err, classYear) => {
    const classYearId = classYear._id;
      return SmallGroup.findOne({'students':userId, 'classYear':classYearId})
    .select('+dayCodes.code')
	  .exec((err, smallgroup) => {

      if (err) { return handleError(res, err); }

      const today = new Date();
      today.setHours(0,0,0,0);
      for (let i = 0;i < smallgroup.dayCodes.length;i++){
        if (today.getTime() === smallgroup.dayCodes[i].date.getTime()){
          return res.status(200).json(smallgroup.dayCodes[i].code)
        }
      }

      //unique code generator, imported from api/lib/helpers.js
      uniqueDayCode(6, (err, dayCode) => {
        if (err) { return handleError(res, err); }
        const code = dayCode;

        smallgroup.dayCodes.push({
          date: today,
          code: code,
          bonusDay: req.body.bonusDay ? true : false
        });

          return smallgroup.save((err, classYear) => {
          if (err) { return handleError(res, err); }
          return res.status(200).json({ code: code })
        });
      });

    });
  });
};

// Delete a day code from a smallgroup and the corresponding daycode submission from attendance
// Restricted to mentors
// router.delete('/:id/day/:dayCode', auth.hasRole('mentor'), controller.deleteDay);

/**
* @api {DELETE} /api/project deleteDay
* @APIname deleteDay
* @APIgroup SmallGroup Controller
* @apidescription Deletes a day/daycode
* @apiPermission Mentors
* @apiSuccess {HTTP} 200 Successfully deleted daycode
* @apiError (Error) 500 Unable to find daycode
*/
exports.deleteDay = (req, res) => {
    const dayCode = req.params.dayCode;
    const smallgroupId = req.params.id;
    SmallGroup.findOneAndUpdate({"_id":smallgroupId}, {
      $pull: { dayCodes: {code : dayCode }}
    })
      .select('+dayCodes.code')
      .exec((err, smallgroup) => {
        if (err) return handleError(res, err);

        return Attendance.remove({code : dayCode}, (err) => {
          if (err) return handleError(res, err);
          return res.status(200).json(smallgroup);
        });
  });
};


// Returns the user profile for a userId
// Only returns private information if the user is a mentor
function getFullUserProfile(userId, mentor, callback){
    User.findById(userId)
    .populate('projects')
    .exec((err, user) => {
        if (err) return callback('Could not find user', null);
        if (!user) return callback('Could not find user', null);
            // Add the user's attendance
        let profile = {};
        if (mentor) {
            profile = user.privateProfile;

            ClassYear.getCurrent((err, classYear) => {
                const classYearId = classYear._id;
                const date = util.convertToMidnight(new Date());

                Attendance.find({classYear:classYearId, date:date, smallgroup:true, user:userId})
                .exec((err, attendance) => {
                    profile.attendance = attendance;
                    callback(null, profile);

                })

            });
        }
        else {
            profile = user.profile;
            callback(null, profile);

        }
    });
}

// Get the members of a smallgroup
// Only returns private information if the user is a mentor
// Restricted to mentors
// router.get('/:id/members', auth.isAuthenticated(), controller.getSmallGroupMembers);
/**
* @api {GET} /api/project getSmallGroupMembers
* @APIname getSmallGroupMembers
* @APIgroup SmallGroup Controller
* @apidescription Get the daycode
* @apiPermission Mentors
* @apiSuccess {Collection} root Returns list of smallgroup members
* @apiError (Error) 500 Unable to find the smallgroup
*/
exports.getSmallGroupMembers = (req, res) => {
    const id = req.params.id;
    SmallGroup.findById(id, (err, smallgroup) => {
        if (err) return handleError(res, err);
        if (!smallgroup) return handleError(res, err);

        const members = [];
        let loadedMembers = 0;

        // Load each group member's full profile

        smallgroup.students.forEach((studentId) => {

            getFullUserProfile(studentId, req.user && req.user.isMentor, (err, member) => {
                loadedMembers ++;
                if (member) {
                    members.push(member);
                }

                // Check if we're done loading members
                if (loadedMembers === smallgroup.students.length) {
                    return res.status(200).json(members);
                }
            })
        });
    });
};

// Add a member to a smallgroup
// Restricted to mentors
// router.put('/:id/member', auth.hasRole('mentor'), controller.addMember);
/**
* @api {POST} /api/project addMember
* @APIname addMember
* @APIgroup SmallGroup Controller
* @apidescription Add a member to the smallgroup
* @apiPermission Mentors
* @apiSuccess {HTTP} 200 Successfully added the member
* @apiError (Error) 500 Unable to add the member
*/
exports.addMember = (req, res) => {
    const memberId = req.body.memberId;
    const smallGroupId = req.params.id;
    return ClassYear.getCurrent((err, classYear) => {
        const classYearId = classYear._id;
        return SmallGroup.findOneAndUpdate({'students': memberId, 'classYear':classYearId}, {
            $pull: { students : memberId }
        }, (err, smallgroup) => {
            if (err) return handleError(res, err);
            return SmallGroup.findOneAndUpdate({_id: smallGroupId}, {
                $addToSet: { students : memberId }
            }, (err, smallgroup) => {
                if (err) return handleError(res, err);
                return res.sendStatus(200);
            });
        });
    });
};

// Delete a member from a smallgroup
// Restricted to mentors
// router.delete('/:id/member/:memberId', auth.isAuthenticated(), controller.deleteMember);
/**
* @api {DELETE} /api/project deleteMember
* @APIname deleteMember
* @APIgroup SmallGroup Controller
* @apidescription Delete a member from the smallgroup
* @apiPermission Mentors
* @apiSuccess {HTTP} 200 Successfully removed the member
* @apiError (Error) 500 Unable to remove the member
* @apiError (Error) 403 Member not deleted
*/
exports.deleteMember = (req, res) => {
    const memberId = req.params.memberId;
    const smallGroupId = req.params.id;
    if (req.user.id === memberId || req.user.role !== 'user' ){
    return SmallGroup.findOneAndUpdate({_id: smallGroupId}, {
        $pull: { students : memberId }
    }, (err, smallgroup) => {
        if (err) return handleError(res, err);
        return res.sendStatus(200);
    }); }
    return res.sendStatus(403);
};

// Change ths name of a smallgroup
// Restricted to mentors
// router.put('/:id/name', auth.isAuthenticated(), controller.changeName);
/**
* @api {GET} /api/project changeName
* @APIname changeName
* @APIgroup SmallGroup Controller
* @apidescription Change the name of a smallgroup
* @apiPermission Mentors
* @apiSuccess {Text} Returns the new name of the smallgroup
* @apiError (Error) 500 Unable to find the smallgroup
*/
exports.changeName = (req,res) => {
  const id = req.params.id;
  const newName = String(req.body.smallGroupName);
    return SmallGroup.findById(id, (err,smallgroup) => {
    if (err) return handleError(res, err);
    smallgroup.name = newName;
    return smallgroup.save((err) => {
      if (err) return validationError(res,err);
      return res.status(200).json({name:smallgroup.name});
    })
  });
};
