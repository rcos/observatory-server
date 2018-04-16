'use strict';

var _ = require('lodash');
var Commit = require('./commit.model');

/**
* @api {GET} /api/commit/ Index
* @APIname Index
* @APIgroup Commit Controller
* @apidescription Gets list of commits by using the Commit.find function. Send an error if it doesn't work, otherwise return json file of commits.
* @apiSuccess {json} index File with list of commits
* @apiError (Error) 500 Internal server error
*/
// Get list of commits
exports.index = function(req, res) {
  Commit.find(function (err, commits) {
    if(err) { return handleError(res, err); }
    return res.json(200, commits);
  });
};
/**
* @api {GET} /api/commit/ Show
* @APIname Show
* @APIgroup Commit Controller
* @apidescription Shows a single commit.
* @apiSuccess {json} show file with one commit
* @apiError (Error) 404 no commits found
* @apiError (Error) 500 Internal server error
*/
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
/**
* @api {GET} /api/commit/ showProjectCommits
* @APIname showProjectCommits
* @APIgroup Commit Controller
* @apidescription Shows a list of a project's commits
* @apiSuccess {json} showProjectCommits File with a list of commits
* @apiError (Error) 404  no commits found
*/
exports.showProjectCommits = function(req, res) {
  Commit.findById(req.params.projectId, function (err, commits) {
    if(err) { return handleError(res, err); }
    if(!commits) { return res.send(404); }
    return res.json(commits);
  });
};

// Get a list of a user Commits
/**
* @api {GET} /api/commit/ showUserCommits
* @APIname showUserCommits
* @APIgroup Commit Controller
* @apidescription Shows a list of commits by a user within a certain timeperiod
* @apiSuccess {json} showUserCommits File with a list of commits
*/
exports.showUserCommits = function(req, res) {
  var prevDays = new Date();
  if (req.params.timeperiod){
    prevDays.setDate(prevDays.getDate()-Number(req.params.timeperiod));
  }
  else{
    prevDays.setDate(prevDays.getDate()-14);
  }

  Commit.find()
        .where('author.login').equals(String(req.params.githubProfile))
        .where('date').gt(prevDays)
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
