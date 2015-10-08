'use strict';

var _ = require('lodash');
var Project = require('./project.model');
var User = require('../user/user.model');
var multiparty = require('multiparty');
var fs = require('fs');
var mkdirp = require('mkdirp');
var config = require('../../config/environment');

// Get list of current projects
exports.index = function(req, res) {
  Project.find({active:true},function (err, projects) {
    if(err) { return handleError(res, err); }
    return res.json(200, projects);
  });
};

// Get list of past projects
exports.indexOld = function(req, res) {
  Project.find({active:false},function (err, projects) {
    if(err) { return handleError(res, err); }
    return res.json(200, projects);
  });
};

// Get a single project
exports.show = function(req, res) {
  if (req.params.username && req.params.project){
    Project.findOne({'githubUsername': req.params.username, 'githubProjectName': req.params.project }, function (err, project) {
      if(err) { return handleError(res, err); }
      if(!project) { return res.send(404); }
      return res.json(project);
    });
  }else if (req.params.id){
    Project.findById(req.params.id, function(err, project){
      if(err) { return handleError(res, err); }
      if(!project) { return res.send(404); }
      return res.json(project);
    });
  }
};

// Get authors on a project
exports.authors = function(req, res) {
    var projectId = req.params.id;
    User.find({projects: projectId}, 'name email', function(err, authors) {
        if (err) { return handleError(res, err); }
        return res.json(200, authors);
    });
}

// Creates a new project in the DB.
exports.create = function(req, res) {
  Project.create(req.body, function(err, project) {
    if(err) { return handleError(res, err); }
    return res.json(201, project);
  });
};

// Updates an existing project in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Project.findById(req.params.id, function (err, project) {
    if (err) { return handleError(res, err); }
    if(!project) { return res.send(404); }

    // Only mentors and project owners can update a project
    var userId = req.user._id;
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
};

// Deletes a project from the DB.
exports.destroy = function(req, res) {
  Project.findById(req.params.id, function (err, project) {
    if(err) { return handleError(res, err); }
    if(!project) { return res.send(404); }
    project.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

exports.deletePhoto = function(req, res) {
    var photoName = req.params.photoName;
    var username = req.params.username;
    var project = req.params.project;
    var userId = req.user._id;
    var path = config.imageUploadPath  + req.params.username + '/' + req.params.project;

    Project.findOne({'githubUsername': req.params.username, 'githubProjectName': req.params.project }, function (err, project) {
      if(err) { return handleError(res, err); }
      if(!project) { return res.send(404); }
      if(project.photos.length===10){
        var temp = project.photos.shift();
        var toRemove = path + '/' + temp;
        fs.unlinkSync(toRemove);
      }
      for (var i = 0; i < project.photos.length; i++){
          if (project.photos[i] === photoName){
            project.photos.splice(i, 1);
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

function handleError(res, err) {
  return res.send(500, err);
}

// Checks if a project is marked as default.
exports.isMarkedDefault = function(req, res) {
  //return true;
  console.log("in isMarkedDefault()");
  
  Project.findById(req.params.id, function (err, project) {
    if (err) { return handleError(res, err); }
    return res.json({markedDefault: true});
  });

};

exports.upload = function(req, res) {
  var form = new multiparty.Form();
  form.parse(req, function(err, fields, files) {
    var file = files.file[0];
    var name = file.path.substring(file.path.lastIndexOf('/')).substring(1);
    var path = config.imageUploadPath  + req.params.username + '/' + req.params.project;
    var destPath = path + '/' + name;
    if(!fs.existsSync(path)){
      mkdirp.sync(path);
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
      if(!project) { return res.send(404); }
      if(project.photos.length===10){
        var temp = project.photos.shift();
        var toRemove = path + '/' + temp;
        fs.unlinkSync(toRemove);
      }
      project.photos.push(name);
      project.save(function (err) {
          // TODO handle project saving error
      });
      return res.json(201, name);
    });
  });
};

