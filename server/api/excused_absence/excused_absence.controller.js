import _ from 'lodash'
import { handleError } from '../lib/helpers'
import { STATUS_PENDING } from './constants'
import User from '../user/user.model'
import ExcusedAbsence from './excused_absence.model'

/**
* @api {get} /api/excused_absences Index
* @apiName index
* @apiGroup Excused Absence
* @apiDescription Get list of Excused Absences for the requesting user
* @apiPermission private
* @apiSuccess {Collection} root Collection of all the user's Excused Absences.
* @apiError (500) UnknownException Could not retrieve ExcusedAbsence collection
*/
exports.index = (req, res) => {
  return ExcusedAbsence.find({ user: req.user._id })
  .then((collection) => {
    return res.json(200, collection).end()
  })
  .catch((err) => {
    return handleError(res, err)
  })
};

/**
* @api {get} /api/excused_absences/:id Show
* @apiName show
* @apiGroup Excused Absence
* @apiDescription Show an individual ExcusedAbsence
* @apiPermission private
* @apiSuccess {Model} root A single ExcusedAbsence model
* @apiError (500) UnknownException Could not retrieve ExcusedAbsence model
*/
exports.show = (req, res) => {
  // Post.findById(req.params.id)
  // .populate('author')
  // .exec(function (err, post) {
    // if(err) { return handleError(res, err); }
    // if(!post) { return res.send(404); }
    // return res.json(post);
  // });
  return ExcusedAbsence.findById(req.params.id)
  .then((model) => {
    return res.json(200, model).end()
  })
  .catch((err) => {
    return handleError(err)
  })
};

/**
* @api {post} /api/excused_absences/:id Create
* @apiName create
* @apiGroup Excused Absence
* @apiDescription Create a new ExcusedAbsence record
* @apiPermission private
* @apiSuccess {Model} root A single ExcusedAbsence model
* @apiError (500) UnknownException Could not create ExcusedAbsence model
*/
exports.create = (req, res) => {

  // Isolates ExcusedAbsence attributes
  let user = req.user._id
  let status = STATUS_PENDING
  let { excuse, date } = req.body

  return ExcusedAbsence.create({ excuse, date, user, status })
  .then((model) => {
    return res.json(201, model)
  })
  .catch((err) => {
    return handleError(res, err)
  })

};

/**
* @api {put} /api/excused_absences/:id Update
* @apiName update
* @apiGroup Excused Absence
* @apiDescription Update a new ExcusedAbsence record
* @apiPermission private
* @apiSuccess {Model} root The updated ExcusedAbsence model
* @apiError (500) UnknownException Could not update ExcusedAbsence model
*/
exports.update = (req, res) => {

  Post.findById(req.params.id, function (err, post) {
    if (err) { return handleError(res, err); }
    if(!post) { return res.send(404); }

    // Only the post's author, a mentor, or an admin can edit the post
    var userId = req.user._id;
    User.findById(userId, function(err, user) {
      if (err) { return handleError(res, err); }

      if (userId.equals(post.author) || user.role === 'mentor' || user.role === 'admin'){
        var updated = _.merge(post, req.body);
        updated.save(function (err) {
          if (err) { return handleError(res, err); }
          return res.json(200, post);
        });
      } else {
        return handleError(res, err);
      }
    });
  });
};

/**
* @api {delete} /api/excused_absences/:id Delete
* @apiName delete
* @apiGroup Excused Absence
* @apiDescription Deletes an ExcusedAbsence record
* @apiPermission private
* @apiSuccess {Model} root The updated Excused Absence model
* @apiError (500) UnknownException Could not update ExcusedAbsence model
*/
exports.destroy = (req, res) => {
  Post.findById(req.params.id, function (err, post) {
    if(err) { return handleError(res, err); }
    if(!post) { return res.send(404); }

    // Only the post's author, a mentor, or an admin can delete the post
    var userId = req.user._id;
    User.findById(userId, function(err, user) {
      if (err) { return handleError(res, err); }
      if (userId.equals(post.author) || user.role === 'mentor' || user.role === 'admin'){
        post.remove(function(err) {
          if(err) { return handleError(res, err); }
          return res.send(204);
        });
      } else {
        return handleError(res, err);
      }

    });

  });
};
