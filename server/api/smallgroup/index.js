'use strict';

var express = require('express');
var controller = require('./smallgroup.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);

router.post('/', auth.hasRole('mentor') || auth.hasRole('admin'), controller.create);
router.put('/:id', auth.hasRole('mentor') || auth.hasRole('admin'), controller.modify);
router.get('/:id/members', auth.isAuthenticated(), controller.getSmallGroupMembers);
router.put('/:id/member', auth.hasRole('mentor') || auth.hasRole('admin'), controller.addMember);
router.delete('/:id/member/:memberId', auth.hasRole('mentor') || auth.hasRole('admin'), controller.deleteMember);
router.get('/:id', auth.isAuthenticated(), controller.getSmallGroup);
router.delete('/:id', auth.hasRole('mentor') || auth.hasRole('admin'), controller.delete);
router.post('/:id/daycode', auth.hasRole('mentor') || auth.hasRole('admin'), controller.daycode);

module.exports = router;
