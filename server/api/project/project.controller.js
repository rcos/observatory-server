'use strict';

var _ = require('lodash');
var Project = require('./project.model');
var User = require('../user/user.model');
var mongoose = require('mongoose');

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

// Get a single project by id
exports.showProject = function(req, res) {
  Project.findById(req.params.projectId, function (err, project) {
    if(err) { return handleError(res, err); }
    if(!project) { return res.send(404); }
    return res.json(project);
  });
};

// Get a single project
exports.show = function(req, res) {
  Project.findOne({'githubUsername': req.params.username, 'githubProjectName': req.params.project })
  .populate('authors')
  .exec(function (err, project) {
    if(err) { return handleError(res, err); }
    if(!project) { return ProjectNotFoundError(res); }
    return res.json(project);
  });
};

// router.get('/author/:id', controller.showByAuthor);
// Get list of author's projects
exports.showByAuthor = function(req, res) {

  Project.find({'authors':req.params.id},function (err, projects) {
    if(err) { return handleError(res, err); }
    return res.json(200, projects);
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
    if(!project) { return ProjectNotFoundError(res); }

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
      }
      return handleError(res, err);
    });
  });
};

// Adds an author to an existing project
exports.addAuthor = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Project.findById(req.params.id, function (err, project) {
    if (err) { return handleError(res, err); }
    if(!project) { return ProjectNotFoundError(res); }

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
      }
      return handleError(res, err);
    });
  });
};

// Deletes a project from the DB.
exports.destroy = function(req, res) {
  Project.findById(req.params.id, function (err, project) {
    if(err) { return handleError(res, err); }
    if(!project) { return ProjectNotFoundError(res); }
    project.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
function ProjectNotFoundError(res) {
  return res.status(404).send("Project not found");
}
