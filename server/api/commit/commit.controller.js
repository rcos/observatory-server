'use strict';

var _ = require('lodash');
var Commit = require('./commit.model');

// Get list of commits
exports.index = function(req, res) {
  Commit.find(function (err, commits) {
    if(err) { return handleError(res, err); }
    return res.json(200, commits);
  });
};

// Get a single commit
exports.show = function(req, res) {
  Commit.findById(req.params.id, function (err, commit) {
    if(err) { return handleError(res, err); }
    if(!commit) { return res.send(404); }
    return res.json(commit);
  });
};

// Creates a new commit in the DB.
exports.create = function(req, res) {
  Commit.create(req.body, function(err, commit) {
    if(err) { return handleError(res, err); }
    return res.json(201, commit);
  });
};

// Updates an existing commit in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Commit.findById(req.params.id, function (err, commit) {
    if (err) { return handleError(res, err); }
    if(!commit) { return res.send(404); }
    var updated = _.merge(commit, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, commit);
    });
  });
};

// Deletes a commit from the DB.
exports.destroy = function(req, res) {
  Commit.findById(req.params.id, function (err, commit) {
    if(err) { return handleError(res, err); }
    if(!commit) { return res.send(404); }
    commit.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};


// Show a list of a projects Commits
// Get a single commit
exports.showProjectCommits = function(req, res) {
  Commit.find({project: req.params.projectId}).populate('project').exec(function (err, commits) {
    if(err) { return handleError(res, err); }
    if(!commits) { return res.send(404); }
    return res.json(commits);
  });
};

// Get a list of a user Commits
exports.showUserCommits = function(req, res) {
  var prevDays = new Date();

  Commit.find()
        .where('author.login').equals(String(req.params.githubProfile))
        .exec(function(err, commits){
          if(err) { return handleError(res, err); }
          if(!commits) { return res.json([]); }
            var commitList = [];
            commits.forEach(function (c){
                var commitObj = c.toObject();
                commitObj.link = "#";
                commitList.push(commitObj);
              });
            return res.json(commitList);
        });
};


function handleError(res, err) {
  return res.send(500, err);
}
