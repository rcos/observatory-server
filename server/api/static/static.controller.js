/**
 * Static data controller
 */

'use strict';

var config = require('../../config/environment');

// Get email
exports.email = function(req, res) {
    var email = {};
    email.address = config.contactEmail;
    return res.status(200).send(email);
}
