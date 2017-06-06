/**
 * Static data controller
 */

'use strict';

var config = require('../../config/environment');

// Get static infos, used phrase "statics" to avoid error
exports.index = function(req, res) {
    var statics = {};
    statics.email = config.contactEmail;
    return res.status(200).send(statics);
}
