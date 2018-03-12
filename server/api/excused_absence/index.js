const express = require('express')
const controller = require('./excused_absence.controller')
const auth = require('../../auth/auth.service')
const router = express.Router()

router.get('/', auth.isAuthenticated(), controller.index)
router.get('/admin', auth.hasRole('admin'), controller.index)
router.get('/:id', auth.isAuthenticated(), controller.show)
router.post('/', auth.isAuthenticated(), controller.create)
router.put('/:id', auth.isAuthenticated(), controller.update)
router.delete('/:id', auth.isAuthenticated(), controller.destroy)

module.exports = router
