'use strict';
import {seed} from '../../config/seed';
import {getSessionFor} from '../../auth/util.integration';
import Attendance from '../attendance/attendance.model';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

describe('GET /api/commits', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/commits')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});

describe('GET /api/attendance', function() {
  before(seed);
  var session,mentorSession;
  before(() => getSessionFor('mentor').then(session => mentorSession = session));

    it('should respond with list of attendance submissions',done=>{
        mentorSession
        .get('/api/attendance')
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.body.should.be.instanceof(Array);
          done(err);
        });
    });

});
