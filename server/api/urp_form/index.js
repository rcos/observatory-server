const express = require('express')
const controller = require('./urp_form.controller')
const auth = require('../../auth/auth.service')
const router = express.Router()

// should add authentication at some point
router.get('/', controller.index)
router.get('/:semester_id', controller.showBySemester)
router.get('/:semester_id/:user_id', controller.showByUserId)
router.post('/:semester_id/:user_id', controller.update)
router.delete('/:semester_id/:user_id', controller.destroy)

module.exports = router
