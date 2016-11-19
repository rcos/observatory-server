'use strict';
import {seed} from '../../config/seed';
import Smallgroup from '../smallgroup/smallgroup.model';
import {getSessionFor} from '../../auth/util.integration';

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

describe('samllgroup attendance test', function() {
  before(seed);
  var mentorSession;
  var bonusDay = false;
  var code ='';
  var smallGroupId = "000000000000000000001000";
  
  before(() => getSessionFor('admin').then(session => mentorSession = session));

  it('should allow mentor create dayCode', done => {
      var bonusDay = false; 

    mentorSession
      .post('/api/smallgroup/daycode')
      .send({
        'bonusDay': bonusDay
      })
      .end((err, res) => {
        code = res.body;
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

