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
router.delete('/:username/:project/:photoName', auth.isAuthenticated(), controller.deletePhoto);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.hasRole('mentor'), controller.destroy);

router.put('/addTechBubble/:id/:tech', auth.hasRole('mentor'), controller.addTechBubble);
router.put('/:id/:tech/removeTech', auth.hasRole('mentor'), controller.removeTech);
module.exports = router;
