'use strict';

var express = require('express');
var controller = require('./project.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/past', controller.indexOld);
router.get('/author/:id', controller.showByAuthor);
router.get('/id/:projectId', controller.showProject);
router.get('/:username/:project', controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;
