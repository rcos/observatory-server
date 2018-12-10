'use strict';

var express = require('express');
var controller = require('./room.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index); //gets all rooms
router.get('/:id', controller.show); //gets single room based on location
router.post('/id', auth.hasRole('admin'), controller.create); //creates a room if user is a mentor
router.put('/id', auth.hasRole('admin'), controller.update); // updates room info if user is a mentor
router.delete('/id', auth.hasRole('admin'), controller.destroy); // delete a room from db if user is a mentor

module.exports = router;
