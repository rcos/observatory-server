'use strict';

var express = require('express');
var controller = require('./attendance.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

// Basic Access / Manipulation
router.get('/', auth.hasRole('mentor'), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.delete('/:id', auth.hasRole('mentor'), controller.destroy);

// Mark attendance as present, subject to verification
router.post('/attend', auth.isAuthenticated(), controller.attend);

// Get attendance for a specific user (or current user)
router.get('/present', auth.isAuthenticated(), controller.getAttendanceMe);
router.get('/:user/present', auth.hasRole('mentor'), controller.getAttendance);

// Verifies existing attendance submissions in the DB.
router.put('/:id/verify', auth.hasRole('mentor'), controller.verifyAttendanceById);

// Set attendance as present (no verification)
router.post('/:user/attend/small', auth.hasRole('mentor'), controller.setAttendanceSmall);
router.post('/:user/attend/full', auth.hasRole('mentor'), controller.setAttendanceFull);
router.post('/:user/attend/smallBonus', auth.hasRole('mentor'), controller.setAttendanceSmallBonus);
router.post('/:user/attend/fullBonus', auth.hasRole('mentor'), controller.setAttendanceFullBonus);

// Gets all users with unverifed attendance for today
router.get('/:date/unverified',  auth.hasRole('mentor'), controller.getUnverifiedAttendanceUsers);
router.get('/:date/unverified/full', auth.hasRole('mentor'), controller.getUnverifiedFullAttendanceUsers);
router.get('/:date/unverified/small', auth.hasRole('mentor'), controller.getUnverifiedSmallAttendanceUsers);

//Gets the number of attendees on a date
router.get('/:dateCode/attendees',auth.hasRole('mentor'), controller.getAttendees);

module.exports = router;
