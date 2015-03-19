'use strict';

var _ = require('lodash');
var Post = require('./post.model');
var User = require('../user/user.model');
var Project = require('../project/project.model');

// Get list of posts
exports.index = function(req, res) {
  Post.find({ project: req.params.project }, function (err, posts) {
    if(err) { return handleError(res, err); }
    return res.json(200, posts);
  });
};

// Get a single post
exports.show = function(req, res) {
  Post.findById(req.params.id, function (err, post) {
    if(err) { return handleError(res, err); }
    if(!post) { return res.send(404); }
    return res.json(post);
  });
};

// Creates a new post in the DB.
exports.create = function(req, res) {
  req.body.author = { id: req.user._id, name: req.user.name };

  // Only someone who is part of the project can write a blog post
  Project.findOne({'githubProjectName': req.body.project }, function (err, project) {
    if(err) { return handleError(res, err); }
    if (project.authors.indexOf(req.user._id) != -1) {
      Post.create(req.body, function(err, post) {
        if(err) { return handleError(res, err); }
        return res.json(201, post);
      });
    }
  });
};

// Updates an existing post in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Post.findById(req.params.id, function (err, post) {
    if (err) { return handleError(res, err); }
    if(!post) { return res.send(404); }

    // Only the post's author, a mentor, or an admin can edit the post
    var userId = req.user._id;
    User.findById(userId, function(err, user) {
      if (err) { return handleError(res, err); }

      if (post.author.id === userId || user.role == 'mentor' || user.role == 'admin'){
        var updated = _.merge(post, req.body);
        updated.save(function (err) {
          if (err) { return handleError(res, err); }
          return res.json(200, post);
        });
      }
      return handleError(res, err);
    });
  });
};

// Deletes a post from the DB.
exports.destroy = function(req, res) {
  Post.findById(req.params.id, function (err, post) {
    if(err) { return handleError(res, err); }
    if(!post) { return res.send(404); }

    // Only the post's author, a mentor, or an admin can delete the post
    var userId = req.user._id;
    User.findById(userId, function(err, user) {
      if (err) { return handleError(res, err); }
      
      if (post.author.id === userId || user.role == 'mentor' || user.role == 'admin'){
        post.remove(function(err) {
          if(err) { return handleError(res, err); }
          return res.send(204);
        });
      }
      return handleError(res, err);
    });

  });
};

function handleError(res, err) {
  return res.send(500, err);
}
