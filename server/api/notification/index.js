'use strict';

const router = require('express').Router();
const controller = require('./notification.controller');
const auth = require('../../auth/auth.service')

// // // //

// GET /notifications
router.get('/', auth.isAuthenticated(), controller.list);

// POST /notifications
router.post('/', auth.hasRole('admin'), controller.create);

// PUT /notifications/:id/dismiss
router.put('/:id/dismiss', auth.isAuthenticated(), controller.dismiss);

// POST /notifications/dismiss_all
router.post('/dismiss_all', auth.isAuthenticated(), controller.dismissAll);

// DELETE /notifications/:id
router.delete('/:id', auth.isAuthenticated(), controller.delete);

// // // //

module.exports = router;
