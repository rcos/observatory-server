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
            "students": [user._id],
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
    SmallGroup.update({"_id": id}, req.body.smallgroup, function(err){
        if (err) return handleError(res, err);
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
        if (!req.user || !req.user.isMentor){
            smallgroup.dayCodes = null;
        }else{
            // This has to be called because "dayCode" is a virtual
            smallgroup.dayCode = smallgroup.dayCode;
        }
        res.json(200, smallgroup);
    });
};

function getFullMember(memberId, callback){
    User.findById(memberId, function(err, member){
        if (err) return callback("Could not find user", null);
        member.getFullProfile(function(fullProfile){
            // Add the user's attendance
            fullProfile.presense = member.presence;
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
            getFullMember(studentId, function(err, member){
                loadedMembers ++;
                if (member){
                    members.push(member);
                }

                // Check if we're done loading members
                if (loadedMembers == smallgroup.students.length){
                    res.json(200, members);
                }
            })
        });
    });
};

function handleError(res, err) {
  return res.send(500, err);
}

function validationError(res, err) {
  return res.json(422, err);
};
