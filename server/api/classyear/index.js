'use strict';

var express = require('express');
var controller = require('./classyear.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

// TODO permissions
router.get('/', controller.index);
router.get('/displayURP', controller.getDisplayURP);
router.get('/semester/:semester',  auth.hasRole('admin'), controller.getClassYear);
router.post('/',  auth.hasRole('admin'), controller.create);
router.post('/daycode', auth.hasRole('admin'), controller.daycode);
router.put('/displayURP', auth.hasRole('admin'), controller.displayURP);
router.put('/semester/:semester', auth.hasRole('admin'), controller.update);
router.delete('/semester/:semester', auth.hasRole('admin') ,controller.destroy);

module.exports = router;
