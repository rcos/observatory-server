/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /abouts              ->  index
 * POST    /abouts              ->  create
 * GET     /abouts/:id          ->  show
 * PUT     /abouts/:id          ->  update
 * DELETE  /abouts/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var About = require('./about.model');

// Get list of things
exports.index = function(req, res) {
  About.find(function (err, things) {
    if(err) { return handleError(res, err); }
    return res.json(200, things);
  });
};

// Get a single thing
exports.show = function(req, res) {
  About.findById(req.params.id, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!about) { return res.send(404); }
    return res.json(thing);
  });
};

// Creates a new thing in the DB.
exports.create = function(req, res) {
  About.create(req.body, function(err, thing) {
    if(err) { return handleError(res, err); }
    return res.json(201, thing);
  });
};

// Updates an existing thing in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  About.findById(req.params.id, function (err, thing) {
    if (err) { return handleError(res, err); }
    if(!about) { return res.send(404); }
    var updated = _.merge(thing, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, thing);
    });
  });
};

// Deletes a thing from the DB.
exports.destroy = function(req, res) {
  About.findById(req.params.id, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!about) { return res.send(404); }
    about.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
