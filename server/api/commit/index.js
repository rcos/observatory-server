'use strict';

var express = require('express');
var controller = require('./commit.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/project/:projectId', controller.showProjectCommits);
router.get('/user/:githubProfile', controller.showUserCommits);
router.get('/user/:githubProfile/days/:timeperiod', controller.showUserCommits);

module.exports = router;
