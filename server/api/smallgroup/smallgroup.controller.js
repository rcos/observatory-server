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
        return res.status(200).json(smallgroups);
    });
};

// Create a new smallgroup for the current class year
// Restricted to mentors
// router.post('/', auth.hasRole('mentor'), controller.create);
exports.create = function(req, res){
    var user = req.user;
    var memberId = req.body.memberId;
    var smallGroupId = req.params.id;
    return ClassYear.getCurrent(function(err, classYear){
        var classYearId = classYear._id;
        return SmallGroup.findOneAndUpdate({"students": memberId, "classYear":classYearId}, {
            $pull: { students : memberId }
        }, function(err, oldSmallgroup){
          if (err) return handleError(res, err);
          var smallgroup = new SmallGroup({
              "name": user.name+"'s Small Group",
              "classYear": classYear._id,
              "enabled": true,
              "students":[user._id],
              "dayCodes": []
          });
          return smallgroup.save().then(()=>res.sendStatus(200));
        });
    });
};

// Modify the smallgroup
// Restricted to mentors
// router.put('/:id', auth.hasRole('mentor'), controller.modify);
exports.modify = function(req, res){
    var id = req.params.id;
    SmallGroup.update({'_id': id}, req.body.smallgroup, function(err){
        if (err) {return handleError(res, err);}
        res.sendStatus(200);
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
        res.sendStatus(200);
    });
};

// Get the smallgroup by id
// Restricted to authenticated users
// Only return daycode is the user is a mentor
// router.get('/:id', auth.isAuthenticated(), controller.getSmallGroup);
exports.getSmallGroup = function(req, res){
    var id = req.params.id;
    var query = SmallGroup.findById(id)
    if (req.user.isMentor){
        query.select('+dayCodes.code')
    }
    return query.exec(function(err, smallgroup){
        if (err) return handleError(res, err);
        if (!smallgroup) return handleError(res, err);
        var responseObject = smallgroup.toObject();
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
exports.daycode = function(req, res){
  var userId = req.user.id;

  return ClassYear.getCurrent(function(err, classYear){
    var classYearId = classYear._id;
    return SmallGroup.findOne({"students":userId, "classYear":classYearId})
    .select('+dayCodes.code')
    .exec(function(err, smallgroup){
        if (err) {return handleError(res, err);}
        var today = new Date();
        today.setHours(0,0,0,0);
        for (var i = 0;i < smallgroup.dayCodes.length;i++){
          if (today.getTime() === smallgroup.dayCodes[i].date.getTime()){

            return res.status(200).json(smallgroup.dayCodes[i].code)
          }
        }
        //unique code generator, function at the bottom.
        uniqueDayCode(generateCode(6),6,function(err,dayCode){
          if (err) return handleError(res, err);
          var code = dayCode;

          smallgroup.dayCodes.push({
            date: today,
            code: code,
            bonusDay: req.body.bonusDay ? true : false
          });
          return smallgroup.save(function(err, classYear){
            if (err) return handleError(res, err);
            return res.status(200).json(code);
        });
      });
    });
  });
};

// Delete a day code from a smallgroup and the corresponding daycode submission from attendance
// Restricted to mentors
// router.delete('/day/:dayCode', auth.hasRole('mentor'), controller.deleteDay);
exports.deleteDay = function(req, res){
    var dayCode = req.params.dayCode;
    return ClassYear.getCurrent(function(err, classYear){
      var classYearId = classYear._id;

      return SmallGroup.findOneAndUpdate({"classYear":classYearId}, {
        $pull: { dayCodes: {code : dayCode }}
      })
      .select('+dayCodes.code')
      .exec(function(err, smallgroup){
        if (err) return handleError(res, err);

        return Attendance.remove({code : dayCode}, function (err){
          if (err) return handleError(res, err);
           return res.status(200).json(smallgroup);
        });
    });
  });
};


// Returns the user profile for a userId
// Only returns private information if the user is a mentor
function getFullUserProfile(userId, mentor, callback){
    User.findById(userId)
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
                    return res.status(200).json(members);
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
    return ClassYear.getCurrent(function(err, classYear){
        var classYearId = classYear._id;
        return SmallGroup.findOneAndUpdate({"students": memberId, "classYear":classYearId}, {
            $pull: { students : memberId }
        }, function(err, smallgroup){
            if (err) return handleError(res, err);
            return SmallGroup.findOneAndUpdate({_id: smallGroupId}, {
                $addToSet: { students : memberId }
            }, function(err, smallgroup){
                if (err) return handleError(res, err);
                return res.sendStatus(200);
            });
        });
    });
};

// Delete a member from a smallgroup
// Restricted to mentors
// router.delete('/:id/member/:memberId', auth.isAuthenticated(), controller.deleteMember);
exports.deleteMember = function(req, res){
    var memberId = req.params.memberId;
    var smallGroupId = req.params.id;
    if(req.user.id === memberId || req.user.role != 'user' ){
    return SmallGroup.findOneAndUpdate({_id: smallGroupId}, {
        $pull: { students : memberId }
    }, function(err, smallgroup){
        if (err) return handleError(res, err);
        return res.sendStatus(200);
    }); }
    return res.sendStatus(403);
};

// Change ths name of a smallgroup
// Restricted to mentors
// router.put('/:id/name', auth.isAuthenticated(), controller.changeName);
exports.changeName = function(req,res){
  var id = req.params.id;
  var newName = String(req.body.smallGroupName);
  return SmallGroup.findById(id, function(err,smallgroup){
    if (err) return handleError(res, err);
    smallgroup.name = newName;
    return smallgroup.save(function(err){
      if (err) return validationError(res,err);
      return res.status(200).json({name:smallgroup.name});
    })
  });
};

// Return a standard error
function handleError(res, err) {
    return res.sendStatus(500, err);
}

// Return a validation error
function validationError(res, err) {
    return res.status(422).json(err);
}

//Generating non ambigious length sized code.
function generateCode(codeLength){
  var characterOptions = "2346789ABCDEFGHJKMNPQRTUVWXYZ";
  //Non ambigious characters and numbers Remove Some if you think they are ambigious given your font.

  var code = ""; //Simple derivation based on previous code generation code.
  for(var i=0;i<codeLength;i++){
      var character = (Math.floor(Math.random() * characterOptions.length));
      code = code.concat(characterOptions[character.toString()]);
  }
  return code;
}

//Generating unique code.
function uniqueDayCode(code,codeLength,callback){  
  ClassYear.findOne({"dayCodes.code":code})
    .exec(function(err, classYear){
      if (err) return callback("error when getting dayCode",null);
      if(classYear) {
        return uniqueDayCode(generateCode(codeLength+1),codeLength+1,callback);
      }
      else{
        SmallGroup.findOne({"dayCodes.code":code})
          .exec(function(err, smallgroup){
            if (err) return callback("error when getting dayCode",null);
            if(smallgroup){
              return uniqueDayCode(generateCode(codeLength+1),codeLength+1,callback);
            }
            return callback(null,code);
        });
      }
  });  
}