'use strict';

var express = require('express');
var controller = require('./classyear.controller');
var auth = require('../../auth/auth.service');
var router = express.Router();

// TODO permissions
router.get('/', controller.index);
router.get('/displayURP', controller.getDisplayURP);
router.get('/semester/:semester', controller.getClassYear);
router.post('/', controller.create);
router.post('/daycode', controller.daycode);
router.put('/displayURP', controller.displayURP);
router.put('/semester/:semester', controller.update);
router.delete('/semester/:semester', auth.hasRole('admin') ,controller.destroy);

module.exports = router;
