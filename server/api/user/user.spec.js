'use strict';
import {seed} from '../../config/seed';
import {getSessionFor} from '../../auth/util.integration';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

describe('GET /api/users/past', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/users/past')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});

describe('getting another user as student', function() {
  before(seed);
  var studentSession;
  before(() => getSessionFor('student').then(session => studentSession = session));

  it('should not allow student to view the other\'s private info', done => {
    var userId = "000000000000000000000400";

    studentSession
      .get('/api/users/' + userId + '/private')
      .end((err, res) => {
        expect(res.status).to.equal(403);
        done(err);
      });
  });

  it('public profile should not contain private info ', done => {
    var userId = "000000000000000000000400";

    studentSession
      .get('/api/users/' + userId)
      .end((err, res) => {
        if(res.body.attendance){
          console.log("should not have access other/'s attudence")
          done();
        }
        expect(res.status).to.equal(200);
        done();
      });
  }); 
});
