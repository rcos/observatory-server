'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/',  controller.list);
router.get('/past', controller.past);
router.get('/search', controller.search);
router.get('/stats', auth.hasRole('admin'), controller.stats);
router.get('/allstats', auth.hasRole('admin'), controller.allStats);
router.get('/:id/commits', controller.commits);
router.get('/:id/avatar', controller.avatar);

router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.post('/:id/role', auth.hasRole('admin'), controller.role);
router.get('/me', auth.isAuthenticated(), controller.me);
router.get('/unverified', controller.getUnverifiedAttendanceUsers);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/:id/deactivate', auth.isAuthenticated(), controller.deactivate);
router.put('/:id/activate', auth.isAuthenticated(), controller.activate);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id/attend', auth.canEdit(), controller.attend);
router.put('/:id/verifyAttendance', auth.hasRole('mentor'), controller.verifyAttendance);
router.put('/:id/bio', auth.canEdit(), controller.changeBio);
router.put('/:id/github', auth.canEdit(), controller.changeGithub);
router.put('/:id/project', auth.isAuthenticated(), controller.addProject);
router.delete('/:id/project', auth.isAuthenticated(), controller.removeProject);
router.put("/:id/addTech", auth.canEdit(), controller.addTech);
router.put("/:id/removeTech", auth.canEdit(), controller.removeTech);
router.post('/resetPassword', controller.resetPassword);
router.put('/:id/removeUser',auth.isAuthenticated(),controller.destroy); 

module.exports = router;
