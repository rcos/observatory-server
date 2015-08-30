'use strict';

var express = require('express');
var controller = require('./classyear.controller');

var router = express.Router();

// TODO permissions
router.get('/', controller.index);
router.get('/:semester', controller.getClassYear);
router.post('/', controller.create);
router.post('/daycode', controller.daycode);
router.put('/:semester', controller.update);
router.delete('/:semester', controller.destroy);

module.exports = router;