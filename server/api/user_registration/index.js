'use strict';

const express = require('express');
const controller = require('./project.controller');
const auth = require('../../auth/auth.service');

const router = express.Router();

	
router.get('/', controller.index); 
router.post('/', controller.create); 
router.get('/:userid', controller.show); 
router.put('/:id', controller.update); 
router.delete('/:userid', controller.destroy); 
	


module.exports = router;
