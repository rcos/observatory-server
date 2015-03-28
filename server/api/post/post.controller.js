'use strict';

var _ = require('lodash');
var Post = require('./post.model');
var User = require('../user/user.model');
var Project = require('../project/project.model');

// Get the posts corresponding to a project
exports.showByProject = function(req, res) {
  Post.find({ "projectId": req.params.projectId })
  .populate('author')
  .exec(function (err, posts) {
    if(err) { return handleError(res, err); }
    return res.json(200, posts);
  });
};

// Get a single post
exports.show = function(req, res) {

  Post.findById(req.params.id)
  .populate('author')
  .exec(function (err, post) {
    if(err) { return handleError(res, err); }
    if(!post) { return res.send(404); }
    return res.json(post);
  });
};

// Creates a new post in the DB.
exports.create = function(req, res) {

  req.body.author = req.user._id;
  if (!req.body.projectId){ return res.status(400).send("Project not set"); }
  Project.findOne({'_id': req.body.projectId }, function (err, project) {
    if(err) { return handleError(res, err); }
    if(!project) { return res.status(404).send("Project not found"); }

    // Only someone who is part of the project can write a blog post
    User.findById(req.user._id, function(err, user) {
      console.log("user",user);
      if (err) { return handleError(res, err); }

      if ((project.authors && project.authors.indexOf(req.user._id) != -1) || user.role == 'mentor' || user.role == 'admin'){
        Post.create(req.body, function(err, post) {
          if(err) { return handleError(res, err); }
          return res.json(201, post);
        });
      }
      else{
        return res.status(403).send("User not part of project");
      }
    });
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

      if (post.author === userId || user.role == 'mentor' || user.role == 'admin'){
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

      if (post.author === userId || user.role == 'mentor' || user.role == 'admin'){
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
