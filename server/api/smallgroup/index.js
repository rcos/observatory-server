'use strict';

var express = require('express');
var controller = require('./smallgroup.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

// TODO permissions
router.get('/', controller.index);
// router.post('/',  auth.hasRole('admin'), controller.create);

// router.get('/displayURP', controller.getDisplayURP);
// router.put('/displayURP', auth.hasRole('admin'), controller.displayURP);

router.post('/', auth.hasRole('mentor'), controller.create);
router.put('/:id', auth.hasRole('mentor'), controller.modify);
router.get('/:id/members', controller.getSmallGroupMembers);
router.put('/:id/member', controller.addMember);
router.get('/:id', auth.isAuthenticated(), controller.getSmallGroup);
router.get('/:id', controller.getSmallGroup);
router.delete('/:id', auth.hasRole('mentor'), controller.delete);

// router.get('/semester/:semester',  auth.hasRole('admin'), controller.getClassYear);
// router.put('/semester/:semester', auth.hasRole('admin'), controller.update);
// router.delete('/semester/:semester', auth.hasRole('admin') ,controller.destroy);

// router.post('/daycode', auth.hasRole('admin'), controller.daycode);

module.exports = router;
