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

// NOT FOR NORMAL USE : does not generate required data for submission
router.post('/', auth.hasRole('admin'), controller.create);
router.put('/:id', auth.hasRole('admin'), controller.update);

// Verifies existing attendance submissions in the DB.
router.put('/:id/verify', auth.hasRole('mentor'), controller.verifyAttendanceById);
router.post('/present/:user/full', auth.hasRole('mentor'), controller.verifyFullAttendance);
router.post('/present/:user/small', auth.hasRole('mentor'), controller.verifySmallAttendance);

// Get attendance for a specific user (or current user) [on a date]
router.get('/present/me/:date', auth.isAuthenticated(), controller.presentMe);
router.get('/present/:user/:date', auth.hasRole('mentor'), controller.present);
router.get('/present/me', auth.isAuthenticated(), controller.getAttendanceMe);
router.get('/present/:user', auth.hasRole('mentor'), controller.getAttendance);

// Mark attendance as present, subject to verification
router.post('/attend', auth.isAuthenticated(), controller.attend);

// Set attendance as present (no verification)
router.post('/attend/:user/small', auth.hasRole('mentor'), controller.setAttendanceSmall);
router.post('/attend/:user/full', auth.hasRole('mentor'), controller.setAttendanceFull);
router.post('/attend/:user/smallBonus', auth.hasRole('mentor'), controller.setAttendanceSmallBonus);
router.post('/attend/:user/fullBonus', auth.hasRole('mentor'), controller.setAttendanceFullBonus);

// Gets all users with unverifed attendance for today
router.get('/unverified/:date',  auth.hasRole('mentor'), controller.getUnverifiedAttendanceUsers);
router.get('/unverified/:date/full', auth.hasRole('mentor'), controller.getUnverifiedFullAttendanceUsers);
router.get('/unverified/:date/small', auth.hasRole('mentor'), controller.getUnverifiedSmallAttendanceUsers);

//Gets the number of attendees on a date
router.get('/code/:dateCode',auth.hasRole('mentor'), controller.getAttendees);

module.exports = router;
