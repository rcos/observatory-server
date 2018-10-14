import _ from 'lodash'
import { handleError } from '../lib/helpers'
import Room from './room.model'

/**
* @api {get} /api/rooms Index
* @apiName index
* @apiGroup Room
* @apiDescription Get list of Rooms for the requesting user
* @apiPermission private
* @apiSuccess {Collection} root Collection of all the user's Rooms.
* @apiError (500) UnknownException Could not retrieve Room collection
*/
exports.index = (req, res) => {
  return Room.find()
  .then((collection) => {
    return res.json(200, collection).end()
  })
  .catch((err) => {
    return handleError(res, err)
  })
}

/**
* @api {get} /api/rooms/:id Show
* @apiName show
* @apiGroup Room
* @apiDescription Show an individual Room
* @apiPermission private
* @apiSuccess {Model} root A single Room model
* @apiError (500) UnknownException Could not retrieve Room model
*/
exports.show = (req, res) => {
  return Room.findById(req.params.id)
  .then((model) => {
    return res.json(200, model).end()
  })
  .catch((err) => {
    return handleError(err)
  })
}

/**
* @api {post} /api/rooms/:id Create
* @apiName create
* @apiGroup Room
* @apiDescription Create a new Room record
* @apiPermission private
* @apiSuccess {Model} root A single Room model
* @apiError (500) UnknownException Could not create Room model
*/
exports.create = (req, res) => {
  return Room.create(req.body)
  .then((model) => {
    return res.json(201, model)
  })
  .catch((err) => {
    return handleError(res, err)
  })

}

/**
* @api {put} /api/rooms/:id Update
* @apiName update
* @apiGroup Room
* @apiDescription Update a new Room record
* @apiPermission private
* @apiSuccess {Model} root The updated Room model
* @apiError (500) UnknownException Could not update Room model
*/
exports.update = (req, res) => {
  return Room.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
  .then((response) => {
      return res.status(200).send(response).end()
  }).catch(next)
}

/**
* @api {delete} /api/rooms/:id Delete
* @apiName delete
* @apiGroup Room
* @apiDescription Deletes an Room record
* @apiPermission private
* @apiSuccess {Model} root The destroyed Room model
* @apiError (500) UnknownException Could not destroy Room model
*/
exports.destroy = (req, res, next) => {
  return Room.remove({ _id: req.params.id })
  .then((response) => {
      return res.status(200).send(response).end()
  }).catch(next)
}
