/**
 * Small Group Controller
 */

'use strict';

var SmallGroup = require('./smallgroup.model');
var ClassYear = require('../classyear/classyear.model');
var User = require('../user/user.model');
var Project = require('../project/project.model');

// Get current class year
exports.index = function(req, res) {
    SmallGroup.find({}, function(err, smallgroups){
        if (err) { return handleError(res, err); }
        return res.json(200, smallgroups);
    });
};

exports.create = function(req, res){
    var user = req.user;
    ClassYear.getCurrent(function(err, currentClassYear){
        if (err) return handleError(res, err);
        var smallgroup = new SmallGroup({
            "name": "New Small Group",
            "semester": currentClassYear.semester,
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

exports.modify = function(req, res){
    var id = req.params.id;
    SmallGroup.update({'_id': id}, req.body.smallgroup, function(err){
        if (err) {return handleError(res, err);}
        res.send(200);
    });
};

exports.delete = function(req, res){
    var id = req.params.id;
    SmallGroup.findById(id, function(err, smallgroup){
        if (err) return handleError(res, err);
        smallgroup.remove();
        res.send(200);
    });
};

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

// Generate a daycode or return the current day code for the
// current class year
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

function getFullMember(memberId, mentor, callback){
    User.findById(memberId, function(err, member){
        if (err) return callback("Could not find user", null);
        member.getFullProfile(function(fullProfile){
            // Add the user's attendance
            fullProfile.presence = member.presence;
            callback(null, fullProfile);

        });
    });
}

exports.getSmallGroupMembers = function(req, res){
    var id = req.params.id;
    SmallGroup.findById(id, function(err, smallgroup){
        if (err) return handleError(res, err);
        var members = [];
        var loadedMembers = 0;

        // Load each group member's full profile

        smallgroup.students.forEach(function(studentId){

            getFullMember(studentId, req.user && req.user.isMentor, function(err, member){
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

exports.addMember = function(req, res){
    var memberId = req.body.memberId;
    var smallGroupId = req.params.id;
	   SmallGroup.findOneAndUpdate({_id: smallGroupId}, {
	      $addToSet: { students : memberId }
	    }, function(err, smallgroup){
		     if (err) return handleError(res, err);
		     User.findById(memberId, function(err, user){
		         if (err) return handleError(res,err); //TODO this error leaves us in a bad state...
		         user.smallgroup = smallGroupId
		         user.save();
		         res.send(200);
		     });
		 });
};

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

function handleError(res, err) {
  return res.send(500, err);
}

function validationError(res, err) {
  return res.json(422, err);
};
