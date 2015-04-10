'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/',  controller.list);
router.get('/past', controller.past);
router.get('/stats', auth.hasRole('admin'), controller.stats);
router.get('/allstats', auth.hasRole('admin'), controller.allStats);
router.get('/:id/commits', controller.commits);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.get('/profile/:url', controller.showByName);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/:id/deactivate', auth.isAuthenticated(), controller.deactivate);
router.put('/:id/activate', auth.isAuthenticated(), controller.activate);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.get("/:id/attendance", auth.canEdit(), controller.attendance);
router.put('/:id/bio', auth.canEdit(), controller.changeBio);
router.put("/:id/addTech", auth.canEdit(), controller.addTech);
router.put("/:id/removeTech", auth.canEdit(), controller.removeTech);

module.exports = router;
