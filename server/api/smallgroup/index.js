'use strict';

var express = require('express');
var controller = require('./smallgroup.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

// TODO permissions
router.get('/', controller.index);

router.post('/', auth.hasRole('mentor'), controller.create);
router.put('/:id', auth.hasRole('mentor'), controller.modify);
router.put('/:id/name',controller.changeName);
router.get('/:id/members', controller.getSmallGroupMembers);
router.put('/:id/member', controller.addMember);
router.get('/:id', auth.isAuthenticated(), controller.getSmallGroup);
router.get('/:id', controller.getSmallGroup);
router.delete('/:id', auth.hasRole('mentor'), controller.delete);

module.exports = router;
