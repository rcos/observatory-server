'use strict';
import {seed} from '../../config/seed';

import {getSessionFor} from '../../auth/util.integration';
import Smallgroup from '../smallgroup/smallgroup.model';
import Attendance from '../attendance/attendance.model';

var should = require('should');
var app = require('../../app');
var request = require('supertest');


describe('GET /api/attendance', function() {
  before(seed);
  var session,mentorSession;
  before(() => getSessionFor('mentor').then(session => mentorSession = session));

    it('should respond with list of attendance submissions', done => {
        mentorSession
        .get('/api/attendance')
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.body.should.be.instanceof(Array);
          done(err);
        });
    });
});

describe('smallgroup attendance test', function() {
  before(seed);
  var mentorSession;
  var bonusDay = false;
  var code ='';
  var smallGroupId = "000000000000000000001000";

  before(() => getSessionFor('admin').then(session => mentorSession = session));

  it('should allow mentor create dayCode', done => {
      var bonusDay = false;

    mentorSession
      .post('/api/smallgroup/' + smallGroupId + '/daycode')
      .send({
        'bonusDay': bonusDay
      })
      .end((err, res) => {
        code = res.body.code;
        expect(res.status).to.equal(200);
        done(err);
      });
  });

  it('should allow admin/mentor/group member submit code', done => {

    mentorSession
      .post('/api/attendance/attend')
      .send({
        'dayCode': code
      })
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done(err);
      });
  });

  var studentSession;
  var studentId = "000000000000000000000300";
  before(() => getSessionFor('student').then(session => studentSession = session));
  it('should allow lone user submit dayCode and that user should be added to a smallgroup', done => {

    studentSession
      .post('/api/attendance/attend')
      .send({
        'dayCode':code
      })
      .end((err, res) => {
        expect(res.status).to.equal(200);
        Smallgroup.findOne({'_id':smallGroupId, 'students':studentId}, function(err, smallgroup){
          //if an error was thrown, user was not in group
          if(err || !smallgroup){
            done(err);
          }
          done();
        });
      });
  });
})

