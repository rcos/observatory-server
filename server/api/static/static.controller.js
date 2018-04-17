'use strict'

const config = require('../../config/environment')

/**
* @api {GET} /api/static Index
* @APIname Index
* @APIgroup Static Controller
* @apidescription Get static infos, used phrase "statics" to avoid error
* @apiSuccess {json} statics object containing RCOS contact email
* @apiError (Error) 500 Internal server error
*/
exports.index = (req, res) => {
    let statics = {}
    statics.email = config.contactEmail
    return res.status(200).json(statics).end()
}
