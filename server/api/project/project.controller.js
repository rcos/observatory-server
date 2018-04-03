'use strict';

var _ = require('lodash');
var Project = require('./project.model');
var User = require('../user/user.model');
var ClassYear = require('../classyear/classyear.model');
var SmallGroup = require('../smallgroup/smallgroup.model');
var multiparty = require('multiparty');
var fs = require('fs');
var mkdirp = require('mkdirp');
var async = require('async');
var config = require('../../config/environment');
var validUrl = require('valid-url');
var mongoose = require('mongoose');


/**
* @api {GET} /api/project Index
* @APIname Index
* @APIgroup Project Controller
* @apidescription Gets list of current projects
* @apiSuccess {json} index file with list of projects
* @apiError (Error) 500 Internal server error
*/
// Get list of current projects
exports.index = function(req, res) {
  Project.find({active:true},function (err, projects) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(projects);
  });
};
/**
* @api {GET} /api/project Stats
* @APIname Stats
* @APIgroup Project Controller
* @apidescription Get various stats for projects
* @apiSuccess {json} stats file with stats for projects
* @apiError (Error) 400 No stats found
* @apiError (Error) 500 Internal server error
*/
// Gets various stats for projects
exports.stats = function(req, res) {
  async.parallel([
        // Count active projects
        function(callback) {
          Project.count({active:true}, function (err, aCount) {
            if (err) return callback(err);
            callback(null, aCount);
          });
        },
        // Count past projects
        function(callback) {
          Project.count({active:false}, function (err, pCount) {
            if (err) return callback(err);
            callback(null, pCount);
          });
        },
      ],
      function(err, results){
        if (err) {
          return res.sendStatus(400);
        }

        if (results === null) {
          return res.sendStatus(400);
        }

        //results contains [activeProjectCount, pastProjectCount]
        var stats = {};
        stats.activeProjects = results[0] || 0;
        stats.pastProjects = results[1] || 0;

        return res.status(200).send(stats);
  });
};

/**
* @api {GET} /api/project Defaults
* @APIname Defaults
* @APIgroup Project Controller
* @apidescription Get list of default projects
* @apiSuccess {json} defaults list of default projects
* @apiError (Error) 500 Internal server error
*/

// Get list of default projects
exports.defaults = function(req, res) {
  Project.find({markedDefault: true}, function (err, projects) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(projects);
  });
};
/**
* @api {GET} /api/project indexOld
* @APIname indexOld
* @APIgroup Project Controller
* @apidescription Get list of past projects
* @apiSuccess {json} indexOld list of past projects
* @apiError (Error) 500 Internal server error
*/
// Get list of past projects
exports.indexOld = function(req, res) {
  Project.find({active:false},function (err, projects) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(projects);
  });
};
/**
* @api {GET} /api/project Show
* @APIname Show
* @APIgroup Project Controller
* @apidescription Show a single project
* @apiSuccess {json} show information about one project
* @apiError (Error) 404 No project found
* @apiError (Error) 500 Internal server error
*/
// Get a single project
exports.show = function(req, res) {
  if (req.params.username && req.params.project){
    Project.findOne({'githubUsername': req.params.username, 'githubProjectName': req.params.project }, function (err, project) {
      if(err) { return handleError(res, err); }
      if(!project) { return res.sendStatus(404); }
      return res.json(project);
    });
  }else if (req.params.id){
    Project.findById(req.params.id, function(err, project){
      if(err) { return handleError(res, err); }
      if(!project) { return res.sendStatus(404); }
      return res.json(project);
    });
  }
};
/**
* @api {GET} /api/project myProjects
* @APIname myProjects
* @APIgroup Project Controller
* @apidescription show the current user's projects
* @apiSuccess {json} myProjects list of projects
* @apiError (Error) 500 Internal server error
*/
exports.myProjects = function(req, res) {
  var userId = req.user._id;
  User.findById(userId).populate('projects').exec(function(err, user){
    if (err) { return handleError(res, err); }
    return res.status(200).json(user.projects);
  });
}
/**
* @api {GET} /api/project Mentees
* @APIname mentees
* @APIgroup Project Controller
* @apidescription Get list of mentees
* @apiSuccess {json} mentees list of mentees
* @apiError (Error) 500 Error when finding mentees
*/
exports.mentees = function(req, res) {
  var userId = req.user._id;

  return ClassYear.getCurrent(function(err, classYear) {
      if(err) { return handleError(res, err); }
      var classYearId = classYear._id;
      var query = SmallGroup.findOne({"students":userId, "classYear":classYearId});

      return query.select('students').exec(function(err, smallgroup){
        if (err) return handleError(res, err);
        if (!smallgroup.students) return res.json([]);
        var mentees_ids = smallgroup.students.map(function(s) {
          return mongoose.Types.ObjectId(s);
        });
        User.find({ "_id": { $in: mentees_ids }} )
          .distinct('projects')
          .exec(function(err, projectIds){
            if (err) return handleError(res, err);
            Project.find({"_id": {$in: projectIds}}).exec(function(err, projects){
              if (err) return handleError(res, err);
              return res.json(projects);
            });
        });
      })
  });

}

/**
* @api {GET} /api/project Authors
* @APIname authors
* @APIgroup Project Controller
* @apidescription Get authors on a project
* @apiSuccess {json} authors list of authors on a project
* @apiError (Error) 500 Unable to find authors
*/
// Get authors on a project
exports.authors = function(req, res) {
    var projectId = req.params.id;
    User.find({projects: projectId}, 'name email', function(err, authors) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(authors);
    });
}

/**
* @api {post} /api/projects Create
* @apiName create
* @apiGroup Project
* @apiDescription Creates a new Project
* @apiPermission authenticated
* @apiSuccess {Model} root The newly created Project.
* @apiError (500) UnknownException Could not retrieve find current User in database
* @apiError (422) UnknownException User's projects could not be updated
*/
exports.create = (req, res) => {

  // Attempts to create new Project record
  Project.create(req.body).then((project, err) => {

    // Project.save() error - likely a validation failure
    if (err) return handleError(res, err)

    // Finds the user by whom this project was created
    User.findById(req.user._id).then((user, err) => {

      // Short-circuits the request if the current user isn't found
      if (err) return res.status(500).send(err)

      // Collects the user's projects
      let projects = user.projects || []

      // Appends the newly created project to the User's list of projects
      if (projects.indexOf(project) !== -1) return
      projects.push(project)

      // Updates the user's 'projects' attribute
      user.set('projects', projects)

      // Persists User `projects` attribute changes
      user.save().then((user, err) => {

        // Handles User update error
        if (err) return res.status(422).json(err)

        // Returns the newly created project
        return res.status(201).json(project)
      })
    })
  })
}

/**
* @api {GET} /api/project Update
* @APIname update
* @APIgroup Project Controller
* @apidescription Updates an existing project
* @apiPermission Mentors/project owners
* @apiSuccess {json} updated information
* @apiError (Error) 404 No project found
* @apiError (Error) 500 Error updating the project
*/
// Updates an existing project in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Project.findById(req.params.id, function (err, project) {
    if (err) { return handleError(res, err); }
    if(!project) { return res.sendStatus(404); }

    // Only mentors and project owners can update a project
    var userId = req.user._id;
    User.findById(userId, function(err, user) {
      if (err) { return handleError(res, err); }

      if (user.projects.indexOf(project._id) >= 0 || user.role === 'mentor' || user.role === 'admin'){

        var urls = req.body.repositories;

        // validate urls, change only if all urls are valid
        var valid = false;
        for (var i = 0; i < urls.length; i++) {
          if (validUrl.isUri(urls[i])) {
            valid = true;
          } else {
            valid = false;
          }
        }

        if (valid === true) {
          project.repositories = req.body.repositories;
        }

        var updated = _.merge(project, req.body);
        updated.save(function (err) {
          if (err) { return handleError(res, err); }
          return res.json(200, project);
        });
      } else {
        return handleError(res, err);
      }
    });
  });
};

/**
* @api {GET} /api/project addTechBubble
* @APIname addTechBubble
* @APIgroup Project Controller
* @apidescription Adds a tech bubble to the project
* @apiSuccess {HTTP} 200 Successfully added tech bubble
* @apiError (Error) 500 Error finding project
*/
//adds a tech bubble to the project
exports.addTechBubble = function(req, res){
	var projectId = req.params.id;
	var newTech = req.params.tech;
	Project.findById(projectId, function(err, project){
		if (err){
			res.status(500).send(err);
		}else{
			if (!project.tech) project.tech=[];
			project.tech.push(newTech);
			project.save(function(err){
				if (err) return validationError(res, err);
				res.sendStatus(200);
			});
		}
	});
};

/**
* @api {GET} /api/project removeTech
* @APIname removeTech
* @APIgroup Project Controller
* @apidescription Removes a tech bubble from the project
* @apiSuccess {HTTP} 200 Successfully removed tech bubble
* @apiError (Error) 500 Error finding project
*/
exports.removeTech = function(req, res){
	var projectId = req.params.id;
	var oldTech = req.params.tech;
	Project.findById(projectId, function(err, project){
		if (err){
			res.status(500).send(err);
		}else{
			if (!project.tech) project.tech = [];
			project.tech.splice(project.tech.indexOf(oldTech), 1);
			project.save(function(err){
				if (err) return validationError(res, err);
				res.sendStatus(200);
			});
		}
	});
};

/**
* @api {GET} /api/project Destroy
* @APIname destroy
* @APIgroup Project Controller
* @apidescription Delete a project from the database
* @apiSuccess {HTTP} 204 Successfully deleted the project
* @apiError (Error) 404 Error finding project
*/
// Deletes a project from the DB.
exports.destroy = function(req, res) {
  Project.findById(req.params.id, function (err, project) {
    if(err) { return handleError(res, err); }
    if(!project) { return res.sendStatus(404); }
    project.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.sendStatus(204);
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}

/**
* @api {GET} /api/project markPast
* @APIname markPast
* @APIgroup Project Controller
* @apidescription Mark a project as a past project
* @apiSuccess {HTTP} 200 Successfully marked the project
* @apiError (Error) 404 Error finding project
*/
exports.markPast = function(req,res){

  var userId = req.user._id;
  Project.findById(req.params.id,function(err,project){
    if(err) { return handleError(res, err); }
    if(!project) { return res.sendStatus(404); }
    User.findById(userId, function(err, user) {
      if (err) { return handleError(res, err); }

      if (user.projects.indexOf(project._id) >= 0 || user.role === 'mentor' || user.role === 'admin'){
            project.update({ active: false }, function(err) {
              if(err) { return handleError(res, err); }
              return res.sendStatus(200);
            });
      } else {
        return handleError(res, err);
      }
    });
  });
};
/**
* @api {GET} /api/project markActive
* @APIname markActive
* @APIgroup Project Controller
* @apidescription Mark a project as being active this semester
* @apiSuccess {HTTP} 200 Successfully marked the project
* @apiError (Error) 404 Error finding project
*/
exports.markActive = function(req,res){
  var userId = req.user._id;
  Project.findById(req.params.id,function(err,project){
    if(err) { return handleError(res, err); }
    if(!project) { return res.sendStatus(404); }
    User.findById(userId, function(err, user) {
      if (err) { return handleError(res, err); }

      if (user.projects.indexOf(project._id) >= 0 || user.role === 'mentor' || user.role === 'admin'){
            project.update({ active: true }, function(err) {
              if(err) { return handleError(res, err); }
              return res.sendStatus(200);
            });
      } else {
        return handleError(res, err);
      }
    });
  });
};

/**
* @api {GET} /api/project markDefaults
* @APIname markDefault
* @APIgroup Project Controller
* @apidescription Mark a project as a default project
* @apiSuccess {HTTP} 200 Successfully marked the project
* @apiError (Error) 404 Error finding project
*/
exports.markDefault = function(req, res) {
  Project.findById(req.params.id, function (err, project) {
    if(err) { return handleError(res, err); }
    if(!project) { return res.sendStatus(404); }
    project.update({ markedDefault: true }, function(err) {
      if(err) { return handleError(res, err); }
      return res.sendStatus(200);
    });
  });
};

/**
* @api {GET} /api/project unmarkDefault
* @APIname markPast
* @APIgroup Project Controller
* @apidescription Unmark a default project
* @apiSuccess {HTTP} 200 Successfully unmarked the project
* @apiError (Error) 404 Error finding project
*/
exports.unmarkDefault = function(req, res) {
  Project.findById(req.params.id, function (err, project) {
    if(err) { return handleError(res, err); }
    if(!project) { return res.sendStatus(404); }
    project.update({ markedDefault: false }, function(err) {
      if(err) { return handleError(res, err); }
      return res.sendStatus(200);
    });
  });
};

/**
* @api {GET} /api/project Upload
* @APIname upload
* @APIgroup Project Controller
* @apidescription Upload an image
* @apiSuccess {HTTP} 201 Successfully uploaded and save the image
* @apiError (Error) 404 Error finding project
* @apiError (Error) 500 Error verifying user
*/
exports.upload = function(req, res) {
  var form = new multiparty.Form();
  form.parse(req, function(err, fields, files) {
    var file = files.file[0];
    var subDir = req.params.username + '/' + req.params.project + '/';
    var name = subDir + file.path.substring(file.path.lastIndexOf('/')).substring(1);
    var path = config.imageUploadPath;
    var destPath = path + name;
    if(!fs.existsSync(path+subDir)){
      mkdirp.sync(path+subDir);
    }
    // Copy file from temp to uploads folder with streams.
    // Allows upload across partitions unlike fs.renameSync
    var is = fs.createReadStream(file.path);
    var os = fs.createWriteStream(destPath);
    is.pipe(os);
    is.on('end', function() {
        fs.unlinkSync(file.path);
    });

    Project.findOne({'githubUsername': req.params.username, 'githubProjectName': req.params.project }, function (err, project) {
      if(err) { return handleError(res, err); }
      if(!project) { return res.sendStatus(404); }
      if(project.photos.length>=10){
        var temp = project.photos.shift();
        var toRemove = path + '/' + temp;
        fs.unlinkSync(toRemove);
      }
      project.photos.push(name);
      project.save(function (err) {
          // TODO handle project saving error
          return res.json(201, name);
      });
    });
  });
};
/**
* @api {GET} /api/project deletePhoto
* @APIname deletePhoto
* @APIgroup Project Controller
* @apidescription Delete a photo
* @apiSuccess {HTTP} 200 Successfully deleted the photo
* @apiError (Error) 404 Error finding project
* @apiError (Error) 500 Error verifying user
*/
exports.deletePhoto = function(req, res) {
    var photoName = req.params.photoName;
    var username = req.params.username;
    var project = req.params.project;
    var userId = req.user._id;
    var path = config.imageUploadPath;
    var name = username + '/' + project + '/' + photoName;

    Project.findOne({'photos': name}, function (err, project) {
      if(err) { return handleError(res, err); }
      if(!project) { return res.sendStatus(404); }
      for (var i = 0; i < project.photos.length; i++){
          if (project.photos[i] === name){
            project.photos.splice(i, 1);
            var toRemove = path + '/' + name;
            fs.unlinkSync(toRemove);
          }
      }
      project.save(function (err) {
        User.findById(userId, function(err, user) {
          if (err) { return handleError(res, err); }

          if (user.projects.indexOf(project._id) >= 0 || user.role === 'mentor' || user.role === 'admin'){
            var updated = _.merge(project, req.body);
            updated.save(function (err) {
            if (err) { return handleError(res, err); }
              return res.json(200, project);
            });
          } else {
            return handleError(res, err);
          }
        });
      });
    });
};

// Return a validation error
function validationError(res, err) {
    return res.status(422).json(err);
}
