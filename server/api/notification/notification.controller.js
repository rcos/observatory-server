const boom = require('boom')
const Notification = require('./notification.model')
const User = require('../user/user.model')

// // // //

/**
* @api {get} /api/notifications Index
* @APIname Index
* @APIgroup Notification Controller
* @apidescription Gets list of current Notifications for req.user
* @apiSuccess {json} Collection of Notifications
* @apiError (Error) 500 Internal server error
*/
module.exports.list = (req, res, next) => {
    return Notification
    .find({ user_id: req.user._id })
    .then((response) => {
        return res
        .status(200)
        .send(response)
        .end();
    })
    .catch( err => next(boom.badImplementation(err)) );
};

// TODO - pending removal
/**
* @api {POST} /api/notifications Create
* @APIname Create
* @APIgroup Notification Controller
* @apidescription Creates a new Notification
* @apiSuccess {json} The newly created Notification
* @apiError (Error) 500 Internal server error
*/
module.exports.create = (req, res, next) => {
    return new Notification(req.body).save()
    .then((response) => {
        return res
        .status(200)
        .send(response)
        .end();
    })
    .catch( err => next(boom.badImplementation(err)) );
};

/**
* @api {PUT} /api/notifications/:id/dismiss Dismiss
* @APIname Dismiss
* @APIgroup Notification Controller
* @apidescription Dismiss a single Notification for req.user
* @apiSuccess {json} The updated Notification
* @apiError (Error) 500 Internal server error
*/
module.exports.dismiss = async (req, res, next) => {
    const notification = await Notification.find({ _id: req.params.id, user_id: req.user.id }).catch( err => next(boom.badImplementation(err)))
    notification.dismissed = true
    await notification.save()
    return res.status(200).json(notification)
};

/**
* @api {POST} /api/notifications/dismiss_all Dismiss All
* @APIname DismissAll
* @APIgroup Notification Controller
* @apidescription Dismiss all Notification for req.user
* @apiSuccess {json} The updated Notification
* @apiError (Error) 500 Internal server error
*/
module.exports.dismissAll = (req, res, next) => {
    return Notification.find({ user_id: req.user._id }, { $set: { dismissed: true } }, { new: true })
    .then((response) => {
        return res
        .status(200)
        .send(response)
        .end();
    })
    .catch( err => next(boom.badImplementation(err)) );
};

/**
* @api {DELETE} /api/notifications/:id Destroy
* @APIname Destroy
* @APIgroup Notification Controller
* @apidescription Destroy a single Notification
* @apiSuccess {json} The destroyed Notification
* @apiError (Error) 500 Internal server error
*/
module.exports.delete = (req, res, next) => {
    return Notification.remove({ _id: req.params.id })
    .then((response) => {
        return res
        .status(200)
        .send(response)
        .end();
    })
    .catch( err => next(boom.badImplementation(err)) );
};
