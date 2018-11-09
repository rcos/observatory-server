import _ from 'lodash'
import { handleError } from '../lib/helpers'
import UserRegistration from './user_registration_model'

/**
* @api {get} /api/user_registration Index
* @apiName index
* @apiGroup UserRegistration
* @apiDescription Get list of UserRegistrations for the requesting user
* @apiPermission private
* @apiSuccess {Collection} root Collection of all the user registration's.
* @apiError (500) UnknownException Could not retrieve UserRegistration collection
*/
exports.index = async (req, res) => {
  try {
    const collection = await UserRegistration.find()
    return res.json(200, collection).end()
  } catch (err) {
    return handleError(res, err)
  }
}

/**
* @api {get} /api/user_registration/:userid Show
* @apiName show
* @apiGroup UserRegistration
* @apiDescription Show an individual user registration
* @apiPermission private
* @apiSuccess {Model} root A single UserRegistration model
* @apiError (500) UnknownException Could not retrieve UserRegistration model
*/
exports.show = async (req, res) => {
  try {
    const model = await UserRegistration.findById(req.params.id)
    return res.json(200, model).end()
  } catch(err) {
    return handleError(res, err)
  }
}


/**
* @api {post} /api/user_registration/ Create
* @apiName create
* @apiGroup UserRegistration
* @apiDescription Create a new UserRegistration record
* @apiPermission private
* @apiSuccess {Model} root A single UserRegistration model
* @apiError (500) UnknownException Could not create UserRegistration model
*/
exports.create = async (req, res) => {
  try {
    const model = await UserRegistration.create(req.body)
    return res.json(201, model)
  } catch(err) {
    return handleError(res, err)
  }
}

/**
* @api {put} /api/user_registration/:id Update
* @apiName update
* @apiGroup UserRegistration
* @apiDescription Update a new UserRegistration record
* @apiPermission private
* @apiSuccess {Model} root The updated UserRegistration model
* @apiError (500) UnknownException Could not update UserRegistration model
*/
exports.update = async (req, res) => {
  try {
    const response = await UserRegistration.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
    return res.status(200).send(response).end()
  } catch (next) {}
}

/**
* @api {delete} /api/user_registration/:userid Delete
* @apiName delete
* @apiGroup UserRegistration
* @apiDescription Deletes an UserRegistration record
* @apiPermission private
* @apiSuccess {Model} root The destroyed UserRegistraion model
* @apiError (500) UnknownException Could not destroy UserRegistration model
*/
exports.destroy = async (req, res, next) => {
  try {
    const response = await UserRegistration.remove({ _userid: req.params.userid })
    return res.status(200).send(response).end()
  } catch (next) {}
}
