const express = require('express');
const controller = require('./urp_form.controller');
const router = express.Router();

// TODO - add authorization to these routes
router.get('/', controller.index);
router.post('/', controller.create);

module.exports = router;
