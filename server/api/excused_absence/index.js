const express = require('express')
const controller = require('./excused_absence.controller')
const auth = require('../../auth/auth.service')
const router = express.Router()

// GET /api/excused_absences
router.get('/', auth.isAuthenticated(), controller.index)

// GET /api/excused_absences/admin
router.get('/admin', auth.hasRole('admin'), controller.admin)

// POST /api/excused_absences
router.post('/', auth.isAuthenticated(), controller.create)

// PUT /api/excused_absences/:id
router.put('/:id', auth.isAuthenticated(), controller.update)

// Admin-only PUTs
// PUT /api/excused_absences/:id
router.put('/:id/approve', auth.hasRole('admin'), controller.update)
router.put('/:id/deny', auth.hasRole('admin'), controller.update)

router.delete('/:id', auth.isAuthenticated(), controller.destroy)

module.exports = router


// User
// [X] List their ExcusedAbsence (show all pending / approved / denied)
// [ ] Create ExcusedAbsence (Request - pending approval)
// [ ] Update ExcusedAbsence (Change note, date, date-range)
// [ ] Delete ExcusedAbsence (It's not needed anymore)

// [X] Admin
// [ ] List ALL ExcusedAbsences
// [ ] Update ExcusedAbsence (something changed - note or date ONLY)
// [ ] Delete ExcusedAbsence (It's not needed anymore)

// [ ] Approve Individual ExcusedAbsence (Approve + leave note)
// [ ] Deny Individual ExcusedAbsence (Deny + leave note)

// [ ] Common to both
// [ ] Update
// [ ] Delete
