'use strict';

var express = require('express');
var controller = require('./urp.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

// TODO permissions
router.post('/', auth.isAuthenticated(), controller.create);
module.exports = router;
