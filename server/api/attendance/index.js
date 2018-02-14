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

// Verifies existing attendance submissions in the DB.
router.put('/:id/verify', auth.hasRole('mentor'), controller.verifyAttendanceById);

// Get attendance for a specific user (or current user) [on a date]
router.get('/present/me/:date', auth.isAuthenticated(), controller.presentMe);
router.get('/present/:user/:date', auth.hasRole('mentor'), controller.present);
router.get('/present/me', auth.isAuthenticated(), controller.getAttendanceMe);
router.get('/present/:user', auth.hasRole('mentor'), controller.getAttendance);

// Mark attendance as present, subject to verification
router.post('/attend', auth.isAuthenticated(), controller.attend);

//Manually adds an attendance entry
router.post('/attend/:user/manual', auth.hasRole('admin'), controller.addManualAttendance);

// Gets all users with unverifed attendance for today
router.get('/unverified/:date',  auth.hasRole('mentor'), controller.getUnverifiedAttendanceUsers);
router.get('/unverified/:date/full', auth.hasRole('mentor'), controller.getUnverifiedFullAttendanceUsers);
router.get('/unverified/:date/small', auth.hasRole('mentor'), controller.getUnverifiedSmallAttendanceUsers);

//Gets the number of attendees on a datecode
router.get('/code/attendees/:dateCode',auth.hasRole('mentor'), controller.getAttendees);

module.exports = router;
