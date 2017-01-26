'use strict';

import app from '../..';
import Attendance from './attendance.model';
import User from '../user/user.model';
import SmallGroup from '../smallgroup/smallgroup.model';
import request from 'supertest';
import superagent from 'superagent';
import {seed} from '../../config/seed';
import {getSessionFor} from '../../auth/util.integration';

describe('Attendance API:', () => {

  describe("Small group attendance", () => {

    before(seed);

    var mentorSession, studentSession;

    before(() => getSessionFor('testmentor').then(session => mentorSession = session));
    before(() => getSessionFor('student').then(session => studentSession = session));

    let smallgroup, mentor, student;

    before(() => {
      // Add the mentor to a small group
      return Promise.all([
        User.findOne({"email": "testmentor@testmentor.com"}),
        SmallGroup.findOne({"name": "New Small Group"}),
        User.findOne({"email": "student@student.com"})
      ]).then(results => {
          mentor = results[0];
          smallgroup = results[1];
          student = results[2];
          smallgroup.students.push(mentor._id);
          smallgroup.students.push(student._id);
          return Promise.all([smallgroup.save(), student.save()]);
        });
    });

    it('should should have put new students in the smallgroup', () => {
      return SmallGroup.findById(smallgroup._id).then(smallgroup => {
        expect(smallgroup.students).to.contain(mentor._id);
        expect(smallgroup.students).to.contain(student._id);
      });
    });

    it('should not allow student have access to small group day codes', done => {
     studentSession
       .post('/api/smallgroup/daycode')
       .end((err, res) => {
         expect(res.status).to.equal(403);
         done(err);
       });
   });

    let dayCode;

    it('should allow mentors to generate an attendance code', done => {
      mentorSession
      .post('/api/smallgroup/daycode').end((err, res) => {
        expect(res.body).to.have.length(6);
        dayCode = res.body;
        done(err);
      });
    });

    it('should allow students to submit small group attendance', done => {
      studentSession
      .post('/api/attendance/attend')
      .send({
        "dayCode": dayCode
      })
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done(err);
      });
    });

    it('should indicate that the student\'s attendance had been taken for the small group', done => {
      studentSession.get('/api/attendance/present/me').end((err,res) => {
        expect(res.body[0].present).to.be.true;
        done(err);
      });
    });

  });

  describe("Large group attendance", () => {

    before(seed);

    let adminSession, studentSession;
    let dayCode;

    before(() => getSessionFor('admin').then(session => adminSession = session));
    before(() => getSessionFor('student').then(session => studentSession = session));

    it('should create a large group code', done => {
      adminSession.post('/api/classyear/daycode')
        .send({bonusDay: false})
        .end((err, res) =>{
        expect(res.status).to.equal(200);
        console.error("WARNING: res.body should be used instead of res.text");
        dayCode = res.text;
        done(err);
      });
    });

    it('should allow students to submit large group attendance', done => {
      studentSession
      .post('/api/attendance/attend')
      .send({
        "dayCode": dayCode
      })
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done(err);
      });
    });

    it('should indicate that the student\'s attendance had been taken for the large group', done => {
      studentSession.get('/api/attendance/present/me').end((err,res) => {
        done(err);
      });
    });

  });

});
