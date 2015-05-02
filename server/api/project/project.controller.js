'use strict';

var _ = require('lodash');
var Project = require('./project.model');
var User = require('../user/user.model');
var multiparty = require('multiparty');
var fs = require('fs');
var mkdirp = require('mkdirp');

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
  Project.findOne({'githubUsername': req.params.username, 'githubProjectName': req.params.project }, function (err, project) {
    if(err) { return handleError(res, err); }
    if(!project) { return res.send(404); }
    return res.json(project);
  });
};

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

      if (project.authors.indexOf(userId) >= 0 || user.role === 'mentor' || user.role === 'admin'){
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

function handleError(res, err) {
  return res.send(500, err);
}

exports.upload = function(req, res) {
  var form = new multiparty.Form();
  form.parse(req, function(err, fields, files) {
    console.log(files.file[0].path);
    var file = files.file[0];
    var name = file.path.substring(file.path.lastIndexOf('/')).substring(1);
    var path = '/var/www/uploads/' + req.params.username + '/' + req.params.project;
    var destPath = path + '/' + name;
    if(!fs.existsSync(path)){
      mkdirp.sync(path);
    }
    fs.rename(file.path, destPath, function (err) {
      if (err) console.error(err)
    });
    console.log(destPath);
    Project.findOne({'githubUsername': req.params.username, 'githubProjectName': req.params.project }, function (err, project) {
      if(err) { return handleError(res, err); }
      if(!project) { return res.send(404); }
      if(project.photos.length==10){
        var temp = project.photos.shift();
        var toRemove = path + '/' + temp;
        fs.unlinkSync(toRemove);
      }
      project.photos.push(name);
      project.save(function (err) {
        console.error(err);
      });
    });
  });
};

