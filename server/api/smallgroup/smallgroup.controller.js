/**
* Small Group Controller
*/

'use strict';

var SmallGroup = require('./smallgroup.model');
var ClassYear = require('../classyear/classyear.model');
var Attendance = require('../attendance/attendance.model');
var User = require('../user/user.model');
var Project = require('../project/project.model');

// Convert dates to midnight
function isoDateToTime(isoDate){
    var date = new Date(isoDate);
    date.setHours(0,0,0,0);
    return date.getTime();
}

// Get all smallgroups
// Restricted to authenticated users
// router.get('/', auth.isAuthenticated(), controller.index);
// TODO: only return smallgroups for this year
exports.index = function(req, res) {
    SmallGroup.find({}, function(err, smallgroups){
        if (err) { return handleError(res, err); }
        return res.json(200, smallgroups);
    });
};

// Create a new smallgroup for the current class year
// Restricted to mentors
// router.post('/', auth.hasRole('mentor'), controller.create);
exports.create = function(req, res){
    var user = req.user;
    ClassYear.getCurrent(function(err, currentClassYear){
        if (err) return handleError(res, err);
        var smallgroup = new SmallGroup({
            "name": "New Small Group",
            "classYear": currentClassYear._id,
            "enabled": true,
            "students":[user._id],
            "dayCodes": []
        });
        smallgroup.save();
        user.smallgroup = smallgroup._id;
        user.save();
        res.send(200);
    });
};

// Modify the smallgroup
// Restricted to mentors
// router.put('/:id', auth.hasRole('mentor'), controller.modify);
exports.modify = function(req, res){
    var id = req.params.id;
    SmallGroup.update({'_id': id}, req.body.smallgroup, function(err){
        if (err) {return handleError(res, err);}
        res.send(200);
    });
};

// Delete the smallgroup
// Restricted to mentors
// router.put('/:id', auth.hasRole('mentor'), controller.modify);
exports.delete = function(req, res){
    var id = req.params.id;
    SmallGroup.findById(id, function(err, smallgroup){
        if (err) return handleError(res, err);
        smallgroup.remove();
        res.send(200);
    });
};

// Get the smallgroup for the user
// Restricted to authenticated users
// Only return daycode is the user is a mentor
// router.get('/:id', auth.isAuthenticated(), controller.getSmallGroup);
exports.getSmallGroup = function(req, res){
    var id = req.params.id;
    SmallGroup.findById(id, function(err, smallgroup){
        if (err) return handleError(res, err);
        if (!smallgroup) return handleError(res, err);
        var responseObject = smallgroup.toObject();
        // If user is not a mentor or not authenticated, don't give dayCode
        if (!req.user || !req.user.isMentor){
            responseObject.dayCodes = null;
        }else{
            // Mentors should get a day code
            // Generate a day code if one does not already exist
            if (smallgroup.dayCode){
                responseObject.dayCode = smallgroup.dayCode;
            }
        }
        res.json(200, responseObject);
    });
};

// Generate a daycode or return the current day code for the smallgroups
// Restricted to mentors
// router.post('/:id/daycode', auth.hasRole('mentor'), controller.daycode);
exports.daycode = function(req, res){
    var id = req.params.id;
    SmallGroup.findById(id, function(err, smallgroup){
        if (err) {return handleError(res, err);}
        var responseObject = smallgroup.toObject();
        // Generate a day code if one does not already exist
        if (!smallgroup.dayCode){
            var code = (Math.floor(Math.random() * Math.pow(36, 6))).toString(36).toUpperCase();
            smallgroup.dayCode = code;
        }
        res.json(200, smallgroup.dayCode);
    });
};

// Returns the user profile for a userId
// Only returns private information if the user is a mentor
function getFullUserProfile(userId, mentor, callback){
    User.findById(userId)
    .select('-salt -hashedPassword')
    .populate('projects')
    .exec(function(err, user){
        if (err) return callback("Could not find user", null);
        if (!user) return callback("Could not find user", null);
            // Add the user's attendance
        var profile = {};
        if (mentor){
            profile = user.privateProfile;

            ClassYear.getCurrent(function(err, classYear){
                var classYearId = classYear._id;
                var date = isoDateToTime(new Date());

                Attendance.find({classYear:classYearId, date:date, smallgroup:true, user:userId})
                .exec(function(err, attendance){
                    profile.attendance = attendance;
                    callback(null, profile);

                })

            });
        }
        else{
            profile = user.profile;
            callback(null, profile);

        }
    });
}

// Get the members of a smallgroup
// Only returns private information if the user is a mentor
// Restricted to mentors
// router.get('/:id/members', auth.isAuthenticated(), controller.getSmallGroupMembers);
exports.getSmallGroupMembers = function(req, res){
    var id = req.params.id;
    SmallGroup.findById(id, function(err, smallgroup){
        if (err) return handleError(res, err);
        if (!smallgroup) return handleError(res, err);

        var members = [];
        var loadedMembers = 0;

        // Load each group member's full profile

        smallgroup.students.forEach(function(studentId){

            getFullUserProfile(studentId, req.user && req.user.isMentor, function(err, member){
                loadedMembers ++;
                if (member){
                    members.push(member);
                }

                // Check if we're done loading members
                if (loadedMembers == smallgroup.students.length){
                    return res.json(200, members);
                }
            })
        });
    });
};

// Add a member to a smallgroup
// Restricted to mentors
// router.put('/:id/member', auth.hasRole('mentor'), controller.addMember);
exports.addMember = function(req, res){
    var memberId = req.body.memberId;
    var smallGroupId = req.params.id;
    SmallGroup.findOneAndUpdate({_id: smallGroupId}, {
        $addToSet: { students : memberId }
    }, function(err, smallgroup){
        if (err) return handleError(res, err);
        User.findById(memberId,  '-salt -hashedPassword', function(err, user){
            if (err) return handleError(res,err); //TODO this error leaves us in a bad state...
            user.smallgroup = smallGroupId
            user.save();
            res.send(200);
        });
    });
};

// Delete a member from a smallgroup
// Restricted to mentors
// router.delete('/:id/member/:memberId', auth.hasRole('mentor'), controller.deleteMember);
exports.deleteMember = function(req, res){
    var memberId = req.params.memberId;
    var smallGroupId = req.params.id;
    SmallGroup.findOneAndUpdate({_id: smallGroupId}, {
        $pull: { students : memberId }
    }, function(err, smallgroup){
        if (err) return handleError(res, err);
        User.findById(memberId, function(err, user){
            if (err) return handleError(res,err);
            user.smallgroup = undefined
            user.save();
            return res.send(200);
        });
    });
};

// Change ths name of a smallgroup
// Restricted to mentors
// router.put('/:id/name', auth.isAuthenticated(), controller.changeName);
exports.changeName = function(req,res){
  var id = req.params.id;
  var newName = String(req.body.smallGroupName);
  SmallGroup.findById(id, function(err,smallgroup){
    if (err) return handleError(res, err);
    smallgroup.name = newName;
    smallgroup.save(function(err){
      if (err) return validationError(res,err);
      return res.json({name:smallgroup.name}).send(200);
    })
  });
};

// Return a standard error
function handleError(res, err) {
    return res.send(500, err);
}

// Return a validation error
function validationError(res, err) {
    return res.json(422, err);
}
