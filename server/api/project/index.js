'use strict';

var express = require('express');
var controller = require('./project.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/past', controller.indexOld);
router.get('/:id/authors', controller.authors);
router.get('/:username/:project', controller.show);
router.get('/:id', controller.show);
router.post('/:username/:project/upload', auth.isAuthenticated(), controller.upload);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.hasRole('mentor'), controller.destroy);

module.exports = router;
