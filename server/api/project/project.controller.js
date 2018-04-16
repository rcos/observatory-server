'use strict';

const _ = require('lodash');
const Project = require('./project.model');
const User = require('../user/user.model');
const ClassYear = require('../classyear/classyear.model');
const SmallGroup = require('../smallgroup/smallgroup.model');
const multiparty = require('multiparty');
const fs = require('fs');
const mkdirp = require('mkdirp');
const async = require('async');
const config = require('../../config/environment');
const validUrl = require('valid-url');
const mongoose = require('mongoose');


/**
* @api {GET} /api/project Index
* @APIname Index
* @APIgroup Project Controller
* @apidescription Gets list of current projects
* @apiSuccess {json} index file with list of projects
* @apiError (Error) 500 Internal server error
*/
// Get list of current projects
exports.index = (req, res) => {
    Project.find({active:true}, (err, projects) => {
    if (err) { return handleError(res, err); }
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
exports.stats = (req, res) => {
  async.parallel([
        // Count active projects
        (callback) => {
            Project.count({active:true}, (err, aCount) => {
            if (err) return callback(err);
            callback(null, aCount);
          });
        },
        // Count past projects
        (callback) => {
          Project.count({active:false}, (err, pCount) => {
            if (err) return callback(err);
            callback(null, pCount);
          });
        },
      ],
		 (err, results) => {
        if (err) {
          return res.sendStatus(400);
        }

        if (results === null) {
          return res.sendStatus(400);
        }

        //results contains [activeProjectCount, pastProjectCount]
        const stats = {};
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
exports.defaults = (req, res) => {
    Project.find({markedDefault: true}, (err, projects) => {
    if (err) { return handleError(res, err); }
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
exports.indexOld = (req, res) => {
    Project.find({active:false}, (err, projects) => {
    if (err) { return handleError(res, err); }
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
exports.show = (req, res) => {
  if (req.params.username && req.params.project) {
    Project.findOne({'githubUsername': req.params.username, 'githubProjectName': req.params.project }, (err, project) => {
      if (err) { return handleError(res, err); }
      if (!project) { return res.status(404).json({ error: 'Not Found' }).end(); }
      return res.json(project);
    });
  } else if (req.params.id){
      Project.findById(req.params.id, (err, project) => {
      if (err) { return handleError(res, err); }
      if (!project) { return res.status(404).json({ error: 'Not Found' }).end(); }
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
exports.myProjects = (req, res) => {
  const userId = req.user._id;
  User.findById(userId).populate('projects').exec((err, user) => {
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
exports.mentees = (req, res) => {
  const userId = req.user._id;

  return ClassYear.getCurrent((err, classYear) => {
      if (err) { return handleError(res, err); }
      const classYearId = classYear._id;
      const query = SmallGroup.findOne({'students':userId, 'classYear':classYearId});

      return query.select('students').exec((err, smallgroup) => {
        if (err) return handleError(res, err);
        if (!smallgroup.students) return res.json([]);
        const mentees_ids = smallgroup.students.map((s) => {
          return mongoose.Types.ObjectId(s);
        });
        User.find({ '_id': { $in: mentees_ids }} )
          .distinct('projects')
          .exec((err, projectIds) => {
            if (err) return handleError(res, err);
              Project.find({'_id': {$in: projectIds}}).exec((err, projects) => {
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
exports.authors = (req, res) => {
    const projectId = req.params.id;
    User.find({projects: projectId}, 'name email', (err, authors) => {
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
exports.update = (req, res) => {
  if (req.body._id) { delete req.body._id; }
    Project.findById(req.params.id, (err, project) => {
    if (err) { return handleError(res, err); }
    if (!project) { return res.status(404).json({ error: 'Not Found' }).end(); }

    // Only mentors and project owners can update a project
    const userId = req.user._id;
	User.findById(userId, (err, user) => {
      if (err) { return handleError(res, err); }

      if (user.projects.indexOf(project._id) >= 0 || user.role === 'mentor' || user.role === 'admin'){

        const urls = req.body.repositories;

        // validate urls, change only if all urls are valid
        let valid = false;
        for (let i = 0; i < urls.length; i++) {
          if (validUrl.isUri(urls[i])) {
            valid = true;
          } else {
            valid = false;
          }
        }

        if (valid === true) {
          project.repositories = req.body.repositories;
        }

        const updated = _.merge(project, req.body);
        updated.save((err) => {
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
exports.addTechBubble = (req, res) => {
	const projectId = req.params.id;
	const newTech = req.params.tech;
	Project.findById(projectId, (err, project) => {
		if (err){
			res.status(500).send(err);
		} else {
			if (!project.tech) project.tech=[];
			project.tech.push(newTech);
			project.save((err) => {
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
exports.removeTech = (req, res) => {
	const projectId = req.params.id;
	const oldTech = req.params.tech;
    Project.findById(projectId, (err, project) => {
		if (err){
			res.status(500).send(err);
		} else {
			if (!project.tech) project.tech = [];
			project.tech.splice(project.tech.indexOf(oldTech), 1);
		    project.save((err) => {
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
exports.destroy = (req, res) => {
  Project.findById(req.params.id, (err, project) => {
    if(err) { return handleError(res, err); }
    if(!project) { return res.status(404).json({ error: 'Not Found' }).end(); }
      project.remove((err) => {
      if (err) { return handleError(res, err); }
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
exports.markPast = (req,res) => {

  const userId = req.user._id;
    Project.findById(req.params.id, (err,project) => { 
    if (err) { return handleError(res, err); }
    if (!project) { return res.status(404).json({ error: 'Not Found' }).end(); }
	User.findById(userId, (err, user) => {
      if (err) { return handleError(res, err); }

      if (user.projects.indexOf(project._id) >= 0 || user.role === 'mentor' || user.role === 'admin'){
            project.update({ active: false }, (err) => {
              if (err) { return handleError(res, err); }
              return res.status(200).json({ project }).end();
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
exports.markActive = (req,res) => {
  const userId = req.user._id;
  Project.findById(req.params.id, (err,project) => {
    if (err) { return handleError(res, err); }
    if (!project) { return res.status(404).json({ error: 'Not Found' }).end(); }
      User.findById(userId, (err, user) => {
      if (err) { return handleError(res, err); }

      if (user.projects.indexOf(project._id) >= 0 || user.role === 'mentor' || user.role === 'admin'){
            project.update({ active: true }, (err) => {
              if (err) { return handleError(res, err); }
              return res.status(200).json({ project }).end();
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
exports.markDefault = (req, res) => {
  Project.findById(req.params.id, (err, project) => {
    if (err) { return handleError(res, err); }
    if (!project) { return res.status(404).json({ error: 'Not Found' }).end(); }
    project.update({ markedDefault: true }, (err) => {
      if (err) { return handleError(res, err); }
      return res.status(200).json({ project }).end();
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
exports.unmarkDefault = (req, res) => {
  Project.findById(req.params.id, (err, project) => {
    if (err) { return handleError(res, err); }
    if (!project) { return res.status(404).json({ error: 'Not Found' }).end(); }
      project.update({ markedDefault: false }, (err) => {
      if (err) { return handleError(res, err); }
      return res.status(200).json({ project }).end();
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
exports.upload = (req, res) => {
  const form = new multiparty.Form();
  form.parse(req, function(err, fields, files) {
    const file = files.file[0];
    const subDir = req.params.username + '/' + req.params.project + '/';
    const name = subDir + file.path.substring(file.path.lastIndexOf('/')).substring(1);
    const path = config.imageUploadPath;
    const destPath = path + name;
      if (!fs.existsSync(path+subDir)) {
      mkdirp.sync(path+subDir);
    }
    // Copy file from temp to uploads folder with streams.
    // Allows upload across partitions unlike fs.renameSync
    const is = fs.createReadStream(file.path);
    const os = fs.createWriteStream(destPath);
    is.pipe(os);
      is.on('end', () => {
        fs.unlinkSync(file.path);
    });

      Project.findOne({'githubUsername': req.params.username, 'githubProjectName': req.params.project }, (err, project) => {
	  if (err) { return handleError(res, err); }
      if (!project) { return res.status(404).json({ error: 'Not Found' }).end(); }
      if(project.photos.length>=10){
        const temp = project.photos.shift();
        const toRemove = path + '/' + temp;
        fs.unlinkSync(toRemove);
      }
      project.photos.push(name);
	  project.save((err) => {
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
exports.deletePhoto = (req, res) => {
    const photoName = req.params.photoName;
    const username = req.params.username;
    const project = req.params.project;
    const userId = req.user._id;
    const path = config.imageUploadPath;
    const name = username + '/' + project + '/' + photoName;

    Project.findOne({'photos': name}, (err, project) => {
      if (err) { return handleError(res, err); }
      if (!project) { return res.status(404).json({ error: 'Not Found' }).end(); }
      for (let i = 0; i < project.photos.length; i++){
          if (project.photos[i] === name){
            project.photos.splice(i, 1);
            const toRemove = path + '/' + name;
            fs.unlinkSync(toRemove);
          }
      }
      project.save((err) => {
        User.findById(userId, (err, user) => {
          if (err) { return handleError(res, err); }

          if (user.projects.indexOf(project._id) >= 0 || user.role === 'mentor' || user.role === 'admin'){
            const updated = _.merge(project, req.body);
            updated.save((err) => {
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
