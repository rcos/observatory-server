'use strict';

// TODO - use `const` instead of `var`
var _ = require('lodash');
var Achievement = require('./achievement.model');

// TODO - abstract into /api/lib/helpers
function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// TODO - abstract into /api/lib/helpers
function responseWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

// TODO - abstract into /api/lib/helpers
function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

// TODO - abstract into /api/lib/helpers
function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.saveAsync()
      .spread(function(updated) {
        return updated;
      });
  };
}

// TODO - abstract into /api/lib/helpers
function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.removeAsync()
        .then(function() {
          res.status(204).end();
        });
    }
  };
}

// // // //

// Gets a list of Achievements
exports.index = function(req, res) {
  Achievement.findAsync()
    .then(responseWithResult(res))
    .catch(handleError(res));
};

// Gets a single Achievement from the DB
exports.show = function(req, res) {
  Achievement.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(responseWithResult(res))
    .catch(handleError(res));
};

// Creates a new Achievement in the DB
exports.create = function(req, res) {
  Achievement.createAsync(req.body)
    .then(responseWithResult(res, 201))
    .catch(handleError(res));
};

// Updates an existing Achievement in the DB
exports.update = function(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Achievement.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));
};

// Deletes a Achievement from the DB
exports.destroy = function(req, res) {
  Achievement.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
};
