const express = require('express');
const controller = require('./team.controller');
const router = express.Router();

// TODO - add authorization to these routes
router.get('/', controller.index);
router.post('/', controller.create);

module.exports = router;
