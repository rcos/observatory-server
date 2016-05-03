'use strict';

var express = require('express');
var controller = require('./project.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/stats', controller.stats);
router.get('/defaults', controller.defaults)
router.get('/past', controller.indexOld);
router.get('/:id/authors', controller.authors);
router.get('/:username/:project', controller.show);
router.get('/:id', controller.show);
router.post('/:username/:project/upload', auth.isAuthenticated(), controller.upload);
router.delete('/:username/:project/:photoName', auth.isAuthenticated(), controller.deletePhoto);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.put('/:id/markdefault', auth.hasRole('admin'), controller.markDefault);
router.put('/:id/unmarkdefault', auth.hasRole('admin'), controller.unmarkDefault);
router.put('/:id/markPast', auth.isAuthenticated(), controller.markPast);
router.put('/:id/markActive', auth.isAuthenticated(), controller.markActive);
router.delete('/:id', auth.hasRole('mentor'), controller.destroy);

router.put('/addTechBubble/:id/:tech', auth.isAuthenticated(), controller.addTechBubble);
router.put('/:id/:tech/removeTech', auth.isAuthenticated(), controller.removeTech);
module.exports = router;
