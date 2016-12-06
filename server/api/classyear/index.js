'use strict';

var express = require('express');
var controller = require('./classyear.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

// TODO permissions
router.get('/', auth.isAuthenticated(), controller.index);
router.post('/',  auth.hasRole('admin'), controller.create);

router.get('/displayURP', controller.getDisplayURP);
router.put('/displayURP', auth.hasRole('admin'), controller.displayURP);

router.get('/semester/:semester',  auth.hasRole('admin'), controller.getClassYear);
router.put('/semester/:semester', auth.hasRole('admin'), controller.update);
router.delete('/semester/:semester', auth.hasRole('admin') ,controller.destroy);

router.post('/daycode', auth.hasRole('admin'), controller.daycode);
router.delete('/day/:dayCode', auth.hasRole('admin'), controller.deleteDay);

module.exports = router;
